import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useQueries, useQuery } from "react-query";
import useItemContract from "../../../../components/hooks/useItemContract";
import GameTemplate from "../../../../components/modules/GameTemplate";
import { itemTypes } from "shared/utils/items";
import { GiStarShuriken } from "react-icons/gi";
import { RiVipDiamondLine, RiSortAsc, RiSortDesc } from "react-icons/ri";
import { FiTriangle } from "react-icons/fi";
import { BiSquare, BiCircle } from "react-icons/bi";
import ClassIcon from "../../../../components/modules/ItemClassIcon";
import { useMemo, useState } from "react";

const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const classes = [
  "Workstation",
  "Software",
  "Connection",
  "Shill",
  "Boost",
  "Consumable",
];

const useCharacterItemIndices = (characterId) => {
  const { contract: itemContract } = useItemContract();

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
  const { contract: itemContract } = useItemContract();

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

  return itemTypes;
};

const useCharacterItemSupply = (characterId, itemTypeId) => {
  const { contract: itemContract } = useItemContract();

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

const ItemBox = ({ characterId, query: { data: itemTypeId, status } = {} }) => {
  const { data: itemSupply } = useCharacterItemSupply(characterId, itemTypeId);
  if (status === "loading") {
    return null;
  }

  return (
    <Tr>
      <Td>
        <ClassIcon classId={itemTypes[itemTypeId.toNumber()].class} />
      </Td>
      <Td>
        <RarityIcon rarity={itemTypes[itemTypeId.toNumber()].rarity} />
      </Td>
      <Td fontSize="sm">{itemTypes[itemTypeId.toNumber()].name}</Td>

      <Td fontSize="sm">{itemTypes[itemTypeId.toNumber()].attack}</Td>
      <Td fontSize="sm">{itemTypes[itemTypeId.toNumber()].attack}</Td>
      <Td fontSize="sm">x{itemSupply?.toString()}</Td>
    </Tr>
  );
};

const useCharacterItems = (characterId) => {
  const { data: indices } = useCharacterItemIndices(characterId);
  const itemTypes = useCharacterItemTypes(characterId, indices);

  return { data: itemTypes };
};

const TableSort = ({ column, sort }) => {
  if (column !== sort.column) {
    return (
      <Box
        display="inline-block"
        mb={-1}
        w={4}
        h={4}
        lineHeight={"1em"}
        flexShrink="0"
      />
    );
  }

  const Direction = sort.direction === "asc" ? RiSortAsc : RiSortDesc;

  return <Icon w={4} h={4} mb={-1} as={Direction} />;
};

const InventoryPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  const { data: items = [] } = useCharacterItems(characterId);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({
    column: "name",
    direction: "asc",
  });

  const filteredItems = useMemo(() => {
    const filteredList = items.filter(({ data: itemTypeId = {} }) => {
      if (!itemTypeId.toNumber) {
        return false;
      }

      return (
        Object.keys(filters).length === 0 ||
        filters[`rarity.${itemTypes[itemTypeId.toNumber()].rarity}`] ||
        filters[`class.${itemTypes[itemTypeId.toNumber()].class}`]
      );
    });

    return filteredList.sort(
      ({ data: itemTypeA = {} }, { data: itemTypeB = {} }) => {
        if (!itemTypeA.toNumber || !itemTypeB.toNumber) {
          return 0;
        }

        const aValue = itemTypes[itemTypeA.toNumber()][sort.column];
        const bValue = itemTypes[itemTypeB.toNumber()][sort.column];

        if (aValue === bValue) {
          return 0;
        }

        if (sort.direction === "asc") {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      }
    );

    return filteredList;
  }, [items, filters, sort]);

  const toggleFilter = (key) => {
    setFilters((state) => {
      if (!filters[key]) {
        return { ...state, [key]: true };
      }
      delete state[key];
      return { ...state };
    });
  };

  const handleSort = (column) => () => {
    if (sort.column === column) {
      setSort((state) => ({
        ...state,
        direction: state.direction === "asc" ? "desc" : "asc",
      }));
    } else {
      setSort({ column, direction: "asc" });
    }
  };

  return (
    <GameTemplate characterId={characterId}>
      <Text mb={5}>Items make your Traveler more powerful.</Text>

      <Grid templateColumns="240px 1fr">
        <GridItem>
          <FormControl mb={5}>
            <FormLabel fontWeight="bold">Rarity</FormLabel>
            <Stack>
              {rarities.map((rarity, i) => {
                return (
                  <Checkbox
                    key={i}
                    size="sm"
                    value={filters[`rarity.${i + 1}`]}
                    onChange={() => toggleFilter(`rarity.${i + 1}`)}
                  >
                    {rarity}
                  </Checkbox>
                );
              })}
            </Stack>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="bold">Class</FormLabel>

            <Stack>
              {classes.map((className, i) => (
                <Checkbox
                  key={i}
                  size="sm"
                  value={filters[`class.${i + 1}`]}
                  onChange={() => toggleFilter(`class.${i + 1}`)}
                >
                  {className}
                </Checkbox>
              ))}
            </Stack>
          </FormControl>
        </GridItem>
        <GridItem>
          <Table>
            <Thead>
              <Tr>
                <Th cursor={"pointer"} onClick={handleSort("class")}>
                  <Stack direction="row">
                    <Text>Class</Text>
                    <TableSort sort={sort} setSort={setSort} column="class" />
                  </Stack>
                </Th>
                <Th cursor="pointer" onClick={handleSort("rarity")}>
                  <Stack direction="row">
                    <Text>Rarity</Text>
                    <TableSort sort={sort} setSort={setSort} column="rarity" />
                  </Stack>
                </Th>
                <Th cursor={"pointer"} onClick={handleSort("name")}>
                  <Stack direction="row">
                    <Text>Name</Text>
                    <TableSort sort={sort} setSort={setSort} column="name" />
                  </Stack>
                </Th>
                <Th cursor={"pointer"} onClick={handleSort("attack")}>
                  <Stack direction="row">
                    <Text>Attack</Text>
                    <TableSort sort={sort} setSort={setSort} column="attack" />
                  </Stack>
                </Th>
                <Th cursor={"pointer"} onClick={handleSort("defense")}>
                  <Stack direction="row">
                    <Text>Defense</Text>
                    <TableSort sort={sort} setSort={setSort} column="defense" />
                  </Stack>
                </Th>
                <Th>Owned</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((query, i) => (
                <ItemBox key={i} characterId={characterId} query={query} />
              ))}
            </Tbody>
          </Table>
        </GridItem>
      </Grid>
    </GameTemplate>
  );
};

export default InventoryPage;
