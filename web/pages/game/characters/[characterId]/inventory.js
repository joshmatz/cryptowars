import { Box, Icon, Stack, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useQueries, useQuery } from "react-query";
import useItemContract from "../../../../components/hooks/useItemContract";
import GameTemplate from "../../../../components/modules/GameTemplate";
import { itemTypes } from "shared/utils/items";
import { GiStarShuriken } from "react-icons/gi";
import {
  RiVipDiamondLine,
  RiSwordLine,
  RiComputerFill,
  RiTerminalBoxFill,
  RiServerFill,
  RiRadarFill,
  RiFireFill,
  RiSpyFill,
  RiUploadCloud2Fill,
} from "react-icons/ri";
import { FiTriangle, FiShield } from "react-icons/fi";
import { BiSquare, BiCircle } from "react-icons/bi";
import { BsShieldFill } from "react-icons/bs";
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

const classes = ["Weapon", "Armor", "Equipment", "Shill"];

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

const RarityIcon = ({ rarity }) => {
  switch (rarity) {
    case 1:
      return <Icon mt={1} as={BiCircle} title="Common" />;
    case 2:
      return <Icon mt={1} as={FiTriangle} title="Uncommon" />;
    case 3:
      return <Icon mt={1} as={BiSquare} title="Rare" />;
    case 4:
      return <Icon mt={1} as={RiVipDiamondLine} title="Epic" />;
    case 5:
      return <Icon mt={1} as={GiStarShuriken} title="Legendary" />;
    default:
      return "Unknown";
  }
};

const ClassIcon = ({ classId }) => {
  switch (classId) {
    case 1:
      return <Icon mt={1} as={RiServerFill} title="Workstations" />;
    case 2:
      return <Icon mt={1} as={RiTerminalBoxFill} title="Software" />;
    case 3:
      return <Icon mt={1} as={RiRadarFill} title="Equipment" />;
    case 4:
      return <Icon mt={1} as={RiSpyFill} title="Shill" />;
    case 5:
      return <Icon mt={1} as={RiFireFill} title="Boost" />;
    case 6:
      return <Icon mt={1} as={RiUploadCloud2Fill} title="Consumable" />;
    default:
      return "Unknown";
  }
};

const ItemBox = ({ characterId, query: { data: itemTypeId, status } = {} }) => {
  const { data: itemSupply } = useCharacterItemSupply(characterId, itemTypeId);
  if (status === "loading") {
    return null;
  }

  return (
    <Box borderBottomWidth={1} mb={5}>
      <Stack direction="row">
        <Text>
          <RarityIcon rarity={itemTypes[itemTypeId.toNumber()].rarity} />
        </Text>
        <Text>
          {itemTypes[itemTypeId.toNumber()].name} x{itemSupply?.toString()}
        </Text>
      </Stack>
      <Stack direction="row">
        <Text>
          <ClassIcon classId={itemTypes[itemTypeId.toNumber()].class} />
        </Text>
        <Text>ATK: {itemTypes[itemTypeId.toNumber()].attack}</Text>
        <Text>DEF: {itemTypes[itemTypeId.toNumber()].attack}</Text>
      </Stack>
    </Box>
  );
};
const useCharacterItems = (characterId) => {
  const { data: indices } = useCharacterItemIndices(characterId);
  const itemTypes = useCharacterItemTypes(characterId, indices);

  return { data: itemTypes };
};

const InventoryPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  const { data: items } = useCharacterItems(characterId);

  return (
    <GameTemplate characterId={characterId}>
      <Text mb={5}>Items make your Traveler more powerful.</Text>

      {items.map((query, i) => (
        <ItemBox key={i} characterId={characterId} query={query} />
      ))}
    </GameTemplate>
  );
};

export default InventoryPage;
