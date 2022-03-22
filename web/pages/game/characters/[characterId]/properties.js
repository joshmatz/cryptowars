import {
  Box,
  Button,
  Input,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useState } from "react";
import useCharacterProperty from "../../../../components/hooks/useCharacterProperty";
import usePropertyContract from "../../../../components/hooks/usePropertyContract";
import usePropertyTypes from "../../../../components/hooks/usePropertyTypes";
import GameTemplate from "../../../../components/modules/GameTemplate";
import { propertyTypeNames } from "../../../../constants/game";
import formatNumber from "../../../../utils/formatNumber";
import useContractMutation from "../../../../components/hooks/useContractMutation";
import useCharacterTokens from "../../../../components/hooks/useCharacterTokens";
import useTimer from "../../../../components/hooks/useTimer";
import PropertyTimer from "../../../../components/modules/PropertyTimer";
import { parseInt } from "lodash";

const calculateUpgradeCost = ({
  costPerLevel,
  cost,
  levels = 1,
  currentLevel = BigNumber.from(1),
}) => {
  return cost
    .mul(levels)
    .add(currentLevel.add(1).add(levels).div(2).mul(levels).mul(costPerLevel));
};

const PropertyRow = ({ characterId, propertyTypeIndex }) => {
  const [upgradesToBuy, setUpgradesToBuy] = useState(1);
  const { data: propertyType } = usePropertyTypes(propertyTypeIndex);
  const { data: characterProperty, refetch } = useCharacterProperty(
    characterId,
    propertyTypeIndex
  );

  const { data: tokens = 0, refetch: refetchTokens } =
    useCharacterTokens(characterId);
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
      onSuccess: () => {
        refetch();
        refetchTokens();
      },
    }
  );

  const { mutate: collectRevenue, status: collectingStatus } =
    useContractMutation(
      () =>
        propertiesContract.collectRevenue(characterId, characterProperty?.id),
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
          refetchTokens();
        },
      }
    );

  const { mutate: upgradeProperty, status: upgradingStatus } =
    useContractMutation(
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
        notificationProgress: {
          title: "Waiting for transaction...",
          description: `${propertyTypeNames[propertyTypeIndex]} is undergoing renovations...`,
        },
      },
      {
        onSuccess: () => {
          refetch();
          refetchTokens();
        },
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

  const isCapableOfPurchasing = propertyType?.cost.lte(tokens);
  const isCapableOfUpgrading = calculateUpgradeCost({
    costPerLevel: propertyType?.costPerLevel,
    cost: propertyType?.cost,
    currentLevel: characterProperty?.level,
  }).lte(tokens);

  return (
    <Stack
      display="flex"
      justifyContent={"space-between"}
      alignItems={{ md: "flex-end" }}
      mb="5"
      borderBottom="1px"
      borderColor="gray.700"
      pb="2"
      flexDirection={{ base: "column", md: "row" }}
    >
      <Box flex="1 0 50%">
        <Text fontWeight="bold">{propertyTypeNames[propertyTypeIndex]}</Text>
        <Stack direction="row" divider={<StackDivider />}>
          <Text fontSize="sm">
            Level {characterProperty.level?.toString() || 0}
          </Text>
          <Text fontSize="sm">
            $
            {formatNumber(
              propertyType?.incomePerLevel?.mul(characterProperty.level || 1)
            )}
            /{(propertyType?.maxCollection || 0) / 60 / 60}h
          </Text>
          {characterProperty.level ? (
            <PropertyTimer
              time={time}
              percentFull={percentFull}
              lastCollected={characterProperty.lastCollected}
              maxCollection={propertyType.maxCollection}
              incomeCapacity={propertyType.incomePerLevel}
              levels={characterProperty.level}
            />
          ) : null}
        </Stack>
      </Box>
      {characterProperty.level ? (
        <Stack>
          <Stack direction="row">
            {!isCapableOfUpgrading ||
            characterProperty.level?.eq(propertyType.maxLevel) ? null : (
              <Input
                type="number"
                value={upgradesToBuy}
                onChange={(e) => setUpgradesToBuy(e.target.value)}
                size="sm"
              />
            )}
            <Button
              flex="1 0 auto"
              onClick={upgradeProperty}
              size="sm"
              disabled={
                calculateUpgradeCost({
                  costPerLevel: propertyType.costPerLevel,
                  cost: propertyType.cost,
                  currentLevel: characterProperty.level,
                  levels: parseInt(upgradesToBuy, 10) || 0,
                }).gt(tokens) ||
                characterProperty.level?.eq(propertyType.maxLevel) ||
                upgradingStatus === "loading"
              }
            >
              {characterProperty.level?.eq(propertyType.maxLevel)
                ? "Max Level"
                : `Upgrade: $${formatNumber(
                    calculateUpgradeCost({
                      costPerLevel: propertyType.costPerLevel,
                      cost: propertyType.cost,
                      currentLevel: characterProperty.level,
                      levels: parseInt(upgradesToBuy, 10) || 0,
                    })
                  )}`}
            </Button>
          </Stack>
          <Button
            flex="1 0 auto"
            onClick={collectRevenue}
            colorScheme={bonusCapacityMul === 11 ? "green" : undefined}
            size="sm"
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
        <Button
          size="sm"
          onClick={purchaseProperty}
          disabled={!isCapableOfPurchasing || collectingStatus === "loading"}
        >
          Purchase: $
          {propertyType?.cost ? formatNumber(propertyType.cost) : null}
        </Button>
      )}
    </Stack>
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
