import { Box, Stack, Text } from "@chakra-ui/react";
import useCharacter from "../hooks/useCharacter";
import useCharacterTokens from "../hooks/useCharacterTokens";
import formatNumber from "../../utils/formatNumber";

const totalExperienceForLevel = (level) => {
  return Math.ceil(100 * (level / 4) ** 2);
};

const totalExperienceNeeded = (currentExperience, nextLevel) => {
  return totalExperienceForLevel(nextLevel);
};

const CharacterBar = ({ characterId }) => {
  const { data: character = {} } = useCharacter(characterId);

  const { data: tokens = 0 } = useCharacterTokens(characterId);

  return (
    <Stack
      display="flex"
      direction={{ base: "column", md: "row" }}
      p={4}
      borderWidth="1px"
      borderColor="gray.600"
      borderBottomWidth="4px"
      mb={5}
      justifyContent="space-between"
    >
      <Box mr={2}>
        <Text fontWeight="bold">Name</Text>
        <Text fontSize="sm" mb={2}>
          {character.name}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Level</Text>
        <Text fontSize="sm" mb={2}>
          {formatNumber(character.level?.toNumber(), { style: "normal" })} (
          {formatNumber(character?.experience?.toNumber(), { style: "normal" })}
          /
          {formatNumber(
            totalExperienceForLevel(character.level?.toNumber() + 1),
            {
              style: "normal",
            }
          )}
          XP)
          {character.skillPoints?.toNumber()
            ? `(${formatNumber(character.skillPoints, {
                isWei: false,
                style: "normal",
              })}SP)`
            : null}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Monies</Text>
        <Text fontSize="sm" mb={2}>
          ${!!tokens ? formatNumber(tokens) : null}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Health</Text>
        <Text fontSize="sm" mb={2}>
          {formatNumber(character?.health?.adjustedCurrent?.toString(), {
            style: "normal",
          })}{" "}
          /{" "}
          {formatNumber(character?.health?.equippedMax?.toString(), {
            style: "normal",
          })}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Energy</Text>
        <Text fontSize="sm" mb={2}>
          {formatNumber(character?.energy?.adjustedCurrent?.toString(), {
            style: "normal",
          })}{" "}
          /{" "}
          {formatNumber(character?.energy?.equippedMax?.toString(), {
            style: "normal",
          })}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Stamina</Text>
        <Text fontSize="sm" mb={2}>
          {formatNumber(character?.stamina?.adjustedCurrent?.toString(), {
            style: "normal",
          })}{" "}
          /{" "}
          {formatNumber(character?.stamina?.equippedMax?.toString(), {
            style: "normal",
          })}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Atk/Def</Text>
        <Text fontSize="sm" mb={2}>
          {formatNumber(character?.attack?.equippedMax?.toString(), {
            style: "normal",
          })}{" "}
          /{" "}
          {formatNumber(character?.defense?.equippedMax?.toString(), {
            style: "normal",
          })}
        </Text>
      </Box>
    </Stack>
  );
};

export default CharacterBar;
