import { Box, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useQueries, useQuery } from "react-query";
import useItemContract from "../../../../components/hooks/useItemContract";
import GameTemplate from "../../../../components/modules/GameTemplate";

// function characterItemTypeListLength(uint256 characterId)
// public
// view
// returns (uint256)
// {
// return characterItemTypes[characterId].length();
// }

// function characterItemType(uint256 characterId, uint256 itemTypeIndex)
// public
// view
// returns (uint256)
// {
// return characterItemTypes[characterId].at(itemTypeIndex);
// }

// function characterItemSupply(uint256 characterId, uint256 itemTypeId)
// public
// view
// returns (uint256)
// {
// return characterItems[characterId][itemTypeId].length();
// }

const useCharacterItemIndices = (characterId) => {
  const itemContract = useItemContract();

  return useQuery(
    ["characterItemIndices", characterId],
    async () => {
      let itemIndices = BigNumber.from(0);
      try {
        itemIndices = await itemContract.characterItemTypeListLength(
          characterId
        );
      } catch (e) {
        console.error(e);
      }

      return Array.apply(null, Array(itemIndices.toNumber()));
    },
    {
      enabled: !!itemContract,
    }
  );
};

const useCharacterItemTypes = (characterId, indices = []) => {
  console.log({ indices });
  const itemContract = useItemContract();

  const itemTypes = useQueries(
    indices.map((_, index) => {
      return {
        queryKey: ["characterItemType", characterId, index],
        queryFn: async () => {
          let itemType;
          try {
            itemType = await itemContract.characterItemType(characterId, index);
          } catch (e) {
            console.error(e);
          }
          return itemType;
        },
      };
    })
  );
  console.log({ itemTypes });

  return itemTypes;
};

const useCharacterItemSupply = (characterId, itemTypeId) => {
  const itemContract = useItemContract();

  return useQuery(
    ["characterItemSupply", characterId, itemTypeId],
    async () => {
      let item;
      try {
        item = await itemContract.characterItemSupply(characterId, itemTypeId);
      } catch (e) {
        console.error(e);
      }

      return item;
    },
    {
      enabled: !!itemContract,
    }
  );
};

const ItemBox = ({ characterId, query: { data: itemTypeId, status } = {} }) => {
  const { data: itemSupply } = useCharacterItemSupply(characterId, itemTypeId);
  if (status === "loading") {
    return null;
  }
  console.log({ itemSupply });
  return (
    <Box>
      <Text>
        {itemTypeId.toString()}: {itemSupply?.toString()}
      </Text>
    </Box>
  );
};
const useCharacterItems = (characterId) => {
  const { data: indices } = useCharacterItemIndices(characterId);
  const itemTypes = useCharacterItemTypes(characterId, indices);
  console.log("ci: ", { itemTypes });
  return { data: itemTypes };
};

const InventoryPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  const { data: items } = useCharacterItems(characterId);
  console.log({ items });
  return (
    <GameTemplate characterId={characterId}>
      <Text mb={5}>Use Items to gain more power in the game.</Text>

      {items.map((query, i) => (
        <ItemBox key={i} characterId={characterId} query={query} />
      ))}
    </GameTemplate>
  );
};

export default InventoryPage;
