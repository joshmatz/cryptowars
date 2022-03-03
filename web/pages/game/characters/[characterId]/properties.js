import {
  Box,
  Button,
  Icon,
  Input,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useState } from "react";
import useCharacterProperty from "../../../../components/hooks/useCharacterProperty";
import usePropertyContract from "../../../../components/hooks/usePropertyContract";
import usePropertyTypes from "../../../../components/hooks/usePropertyTypes";
import GameTemplate from "../../../../components/modules/GameTemplate";
import { propertyTypeNames } from "../../../../constants/game";
import { useEffect } from "react/cjs/react.development";
import { formatDistanceStrict, fromUnixTime } from "date-fns";
import {
  MdOutlineBatteryChargingFull,
  MdBatteryCharging20,
} from "react-icons/md";
import formatNumber from "../../../../utils/formatNumber";
import useContractMutation from "../../../../components/hooks/useContractMutation";

const calculateUpgradeCost = ({
  costPerLevel,
  cost,
  levels = 1,
  currentLevel = BigNumber.from(2),
}) => {
  return cost
    .mul(levels)
    .add(currentLevel.add(levels).div(2).mul(levels).mul(costPerLevel));
};

const useTimer = (lastCollected, maxCollection) => {
  const [time, setTime] = useState(
    lastCollected?.add(maxCollection) - new Date().getTime() / 1000
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time - 1);

      if (time <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  useEffect(() => {
    setTime(lastCollected?.add(maxCollection) - new Date().getTime() / 1000);
  }, [lastCollected, maxCollection]);

  return {
    time,
    percentFull: Math.max(
      0,
      Math.round((100 * (maxCollection - time)) / maxCollection)
    ),
  };
};

const Timer = ({ time, percentFull, lastCollected, maxCollection }) => {
  if (time <= 0) {
    return (
      <Box flex="1 0 auto" display="flex" alignItems="center" mr={5}>
        <Text whiteSpace="nowrap">100% Capacity</Text>
        <Icon as={MdOutlineBatteryChargingFull} w={5} h={5} />
      </Box>
    );
  }

  return (
    <Tooltip
      label={`${formatDistanceStrict(
        fromUnixTime(new Date().getTime() / 1000),
        fromUnixTime(lastCollected.add(maxCollection).toNumber())
      )} to go`}
    >
      <Box display="flex" alignItems="center" mr={5}>
        <Text mr={2}>{percentFull}% Capacity</Text>
        {time !== 0 ? <Icon as={MdBatteryCharging20} w={5} h={5} /> : null}
      </Box>
    </Tooltip>
  );
};

const PropertyRow = ({ characterId, propertyTypeIndex }) => {
  const [upgradesToBuy, setUpgradesToBuy] = useState(1);
  const { data: propertyType } = usePropertyTypes(propertyTypeIndex);
  const { data: characterProperty, refetch } = useCharacterProperty(
    characterId,
    propertyTypeIndex
  );

  const propertiesContract = usePropertyContract();

  const { mutate: purchaseProperty } = useContractMutation(
    () => propertiesContract.purchaseProperty(characterId, propertyTypeIndex),
    {
      notificationSuccess: {
        title: "Contract signed!",
        description: "Now, back to business.",
      },
      notificationProgress: {
        title: "Processing contract...",
        description: `We need a legal team for ${propertyTypeNames[propertyTypeIndex]}?`,
      },
    },
    {
      onSuccess: refetch,
    }
  );

  const { mutate: collectRevenue } = useContractMutation(
    () => propertiesContract.collectRevenue(characterId, characterProperty?.id),
    {
      notificationSuccess: {
        title: "Collection successful!",
        description: "Now, back to business.",
      },
      notificationProgress: {
        title: "Waiting for transaction...",
        description: `${propertyTypeNames[propertyTypeIndex]} revenue is on its way.`,
      },
    },
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const { mutate: upgradeProperty } = useContractMutation(
    () =>
      propertiesContract.upgradeProperty(
        characterId,
        characterProperty?.id,
        upgradesToBuy
      ),
    {
      notificationSuccess: {
        title: "Renovations complete!",
        description: "Now, back to business.",
      },
      noticationProgress: {
        title: "Waiting for transaction...",
        description: `${propertyTypeNames[propertyTypeIndex]} is undergoing renovations...`,
      },
    },
    {
      onSuccess: refetch,
    }
  );

  const { time, percentFull } = useTimer(
    characterProperty?.lastCollected,
    propertyType?.maxCollection
  );

  if (!characterProperty) {
    return null;
  }

  const bonusCapacityMul = Math.min(100, percentFull) === 100 ? 11 : 10;

  return (
    <Box
      display="flex"
      justifyContent={"space-between"}
      alignItems="center"
      mb="5"
      borderBottom="1px"
      borderColor="gray.700"
      pb="2"
    >
      <Box flex="1 0 50%">
        <Text fontWeight="bold">{propertyTypeNames[propertyTypeIndex]}</Text>
        <Stack direction="row">
          <Text>Level {characterProperty.level?.toString() || 0}</Text>
          {characterProperty.level ? (
            <>
              <Text> | </Text>
              <Timer
                time={time}
                percentFull={percentFull}
                lastCollected={characterProperty.lastCollected}
                maxCollection={propertyType.maxCollection}
              />
            </>
          ) : null}
        </Stack>
      </Box>
      {characterProperty.level ? (
        <Stack display="flex">
          <Stack direction="row">
            {characterProperty.level?.eq(propertyType.maxLevel) ? null : (
              <Input
                type="number"
                value={upgradesToBuy}
                onChange={(e) => setUpgradesToBuy(e.target.value)}
              />
            )}
            <Button
              flex="1 0 auto"
              onClick={upgradeProperty}
              disabled={characterProperty.level?.eq(propertyType.maxLevel)}
            >
              {characterProperty.level?.eq(propertyType.maxLevel)
                ? "Max Level"
                : `Upgrade: $${formatNumber(
                    calculateUpgradeCost({
                      costPerLevel: propertyType.costPerLevel,
                      cost: propertyType.cost,
                      currentLevel: characterProperty.level,
                    })
                  )}`}
            </Button>
          </Stack>
          <Button
            flex="1 0 auto"
            onClick={collectRevenue}
            colorScheme={bonusCapacityMul === 11 ? "green" : undefined}
          >
            Collect{" "}
            {propertyType?.incomePerLevel &&
            characterProperty?.level &&
            percentFull
              ? `$${formatNumber(
                  propertyType.incomePerLevel
                    .mul(characterProperty.level)
                    .mul(Math.min(100, percentFull))
                    .div(100)
                )}${
                  percentFull >= 100
                    ? ` + $${formatNumber(
                        propertyType.incomePerLevel
                          .mul(characterProperty.level)
                          .mul(Math.min(100, percentFull))
                          .div(1000)
                      )}`
                    : ""
                }`
              : ""}
          </Button>
        </Stack>
      ) : (
        <Button onClick={purchaseProperty}>
          Purchase: $
          {propertyType?.cost ? formatNumber(propertyType.cost) : null}
        </Button>
      )}
    </Box>
  );
};

const PropertiesPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;

  return (
    <GameTemplate characterId={characterId}>
      <Text mb={5}>
        Purchase properties and level them up for more ponzinomics.
      </Text>

      {Array.apply(null, Array(10)).map((_, i) => {
        return (
          <PropertyRow
            key={i}
            characterId={characterId}
            propertyTypeIndex={i}
          />
        );
      })}
    </GameTemplate>
  );
};

export default PropertiesPage;
