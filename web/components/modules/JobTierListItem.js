import {
  Divider,
  Icon,
  Stack,
  Square,
  useColorModeValue,
  Text,
  Link,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import useJobsContract from "../hooks/useJobsContract";
import { AiFillCheckSquare, AiOutlineBorder } from "react-icons/ai";
import RouterLink from "next/link";
import { FaCircle } from "react-icons/fa";

const tierNames = [
  "Thodex",
  "Quadriga",
  "Mt.Gox",
  "Bitclub Network",
  "Bitconnect",
  "Pincoin",
  "ACChain",
  "Savedroid",
  "PlexCoin",
  "Onecoin",
];

const JobTierListItem = ({ characterId, tierIndex, selectedIndex }) => {
  const jobContract = useJobsContract();
  const { data: unlockedJobTiers } = useQuery(
    `unlockedJobTiers-${characterId}`,
    () => jobContract.characterJobTier(characterId),
    {
      enabled: !!jobContract && !!characterId,
    }
  );

  const jobTierUnlocked = unlockedJobTiers?.toNumber();

  const isUnlocked = jobTierUnlocked > tierIndex;
  const unlockedColor = useColorModeValue("blue.400", "blue.600");
  const lockedColor = useColorModeValue("gray.600", "gray.500");
  const isSelectedIndex = selectedIndex === tierIndex.toString();

  return (
    <Stack direction="column" flex="1">
      <Stack direction="row" alignItems="center" spacing={0}>
        <Divider
          bg={isUnlocked || isSelectedIndex ? unlockedColor : lockedColor}
          h={0.5}
        />
        <Square
          sx={{ marginInlineStart: 0 }}
          size="40px"
          bg={isUnlocked || isSelectedIndex ? unlockedColor : lockedColor}
        >
          <Icon
            w={5}
            h={5}
            as={
              isSelectedIndex
                ? FaCircle
                : isUnlocked
                ? AiFillCheckSquare
                : AiOutlineBorder
            }
          />
        </Square>
        <Divider h={0.5} bg={isUnlocked ? unlockedColor : lockedColor} />
      </Stack>
      <Stack alignItems="center">
        <Text fontWeight={isSelectedIndex ? "bold" : ""} textAlign="center">
          {isUnlocked ? (
            <RouterLink
              passHref
              href={`/game/characters/${characterId}/jobs/${tierIndex}`}
            >
              <Link>{tierNames[tierIndex]}</Link>
            </RouterLink>
          ) : (
            tierNames[tierIndex]
          )}
        </Text>
      </Stack>
    </Stack>
  );
};

export default JobTierListItem;
