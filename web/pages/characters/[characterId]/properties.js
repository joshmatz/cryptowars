import { Box, Button, Text } from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useMutation, useQueries } from "react-query";
import { useWeb3Context } from "../../../components/Web3ContextProvider";
import useCharacterProperty from "../../../components/hooks/useCharacterProperty";
import usePropertyContract from "../../../components/hooks/usePropertyContract";
import usePropertyCount from "../../../components/hooks/usePropertyCount";
import usePropertyTypes from "../../../components/hooks/usePropertyTypes";
import GameTemplate from "../../../components/modules/GameTemplate";
import {
  PropertiesContractAddress,
  PropertiesContractAbi,
  propertyTypeNames,
} from "../../../constants/game";

const PropertyRow = ({ characterId, propertyTypeIndex }) => {
  const { data: propertyType } = usePropertyTypes(propertyTypeIndex);

  const { data: characterProperty } = useCharacterProperty(
    characterId,
    propertyTypeIndex
  );

  const propertiesContract = usePropertyContract();

  const { mutate: purchaseProperty } = useMutation(async () => {
    const tx = await propertiesContract.purchaseProperty(characterId, 0);
    await tx.wait(1, 0, 0, 60);
    return;
  });

  const { mutate: collectRevenue } = useMutation(async () => {
    const tx = await propertiesContract.collectRevenue(characterId, 0);
    await tx.wait(1, 0, 0, 60);
    return;
  });

  const { mutate: upgradeProperty } = useMutation(async () => {
    const tx = await propertiesContract.upgradeProperty(characterId, 0, 1);
    await tx.wait(1, 0, 0, 60);
    return;
  });

  return (
    <Box display="flex" alignItems="center" mb="5">
      <Text mr="5">
        {propertyTypeNames[propertyTypeIndex]} -{" "}
        {characterProperty?.level?.toString()}
      </Text>
      {characterProperty?.level ? (
        <>
          <Button
            onClick={upgradeProperty}
            mr="2"
            disabled={characterProperty?.level?.eq(propertyType.maxLevel)}
          >
            Upgrade
          </Button>
          <Button onClick={collectRevenue}>Collect</Button>
        </>
      ) : (
        <Button onClick={purchaseProperty}>
          Purchase: $
          {propertyType?.cost
            ? ethers.utils.formatEther(propertyType.cost)
            : null}
        </Button>
      )}
    </Box>
  );
};

const CharacterPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  const {
    web3State: { signer, address },
  } = useWeb3Context();

  const propertiesContract = useMemo(() => {
    if (!signer) {
      return null;
    }
    const _pc = new ethers.Contract(
      PropertiesContractAddress,
      PropertiesContractAbi,
      signer
    );
    return _pc;
  }, [signer]);

  const { data: propertiesCount = BigNumber.from(0) } =
    usePropertyCount(address);

  const queries = useQueries(
    Array.apply(null, Array(propertiesCount.toNumber())).map((_, i) => {
      return {
        queryKey: ["propertyIds", address, i],
        queryFn: async () => {
          let propertyId;
          try {
            propertyId = await propertiesContract.tokenOfOwnerByIndex(
              address,
              i
            );
          } catch (e) {
            console.log(e);
          }
          return propertyId;
        },
      };
    })
  );

  return (
    <GameTemplate characterId={characterId}>
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

export default CharacterPage;
