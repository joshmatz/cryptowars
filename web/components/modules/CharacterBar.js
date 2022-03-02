import { Box, Stack, Text } from "@chakra-ui/react";
import useCharacter from "../hooks/useCharacter";
import useCharacterTokens from "../hooks/useCharacterTokens";
import formatNumber from "../../utils/formatNumber";

const totalExperienceForLevel = (level) => {
  return 100 * ((level / 4) ^ 2);
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
        <Text mb={2}>{character.name}</Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Level</Text>
        <Text mb={2}>
          {character.level?.toString()}{" "}
          {character.skillPoints?.toNumber()
            ? `(${character.skillPoints} SP)`
            : null}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Experience</Text>
        <Text mb={2}>{character.experience?.toString()}</Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Monies</Text>
        <Text mb={2}>${!!tokens ? formatNumber(tokens) : null}</Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Health</Text>
        <Text mb={2}>
          {character?.health?.adjustedCurrent?.toString()} /{" "}
          {character?.health?.equippedMax?.toString()}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Energy</Text>
        <Text mb={2}>
          {character?.energy?.adjustedCurrent?.toString()} /{" "}
          {character?.energy?.equippedMax?.toString()}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Stamina</Text>
        <Text mb={2}>
          {character?.stamina?.adjustedCurrent?.toString()} /{" "}
          {character?.stamina?.equippedMax?.toString()}
        </Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Atk/Def</Text>
        <Text mb={2}>
          {character?.attack?.equippedMax?.toString()} /{" "}
          {character?.defense?.equippedMax?.toString()}
        </Text>
      </Box>
    </Stack>
  );
};

export default CharacterBar;
