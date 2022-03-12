import { Text } from "@chakra-ui/react";
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
  const itemTypes = useQueries(
    indices.map((_, index) => {
      return {
        queryKey: ["characterItemType", characterId, index],
        queryFn: async () => {
          let itemType;
          try {
            itemType = await itemContract.characterItemType(characterId);
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

const useCharacterItems = (characterId) => {
  const itemContract = useItemContract();

  const { data: indices } = useCharacterItemIndices(characterId);
  const { data: itemTypes } = useCharacterItemTypes(characterId, indices);

  return {};
};

const InventoryPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  const { data: items } = useCharacterItems(characterId);

  return (
    <GameTemplate characterId={characterId}>
      <Text mb={5}>Use Items to gain more power in the game.</Text>
    </GameTemplate>
  );
};

export default InventoryPage;
