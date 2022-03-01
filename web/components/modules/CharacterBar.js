import { Box, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useWeb3Context } from "../Web3ContextProvider";
import useCharacter from "../hooks/useCharacter";
import useTokens from "../hooks/useTokens";
import formatNumber from "../../utils/formatNumber";

const CharacterBar = ({ characterId }) => {
  const {
    web3State: { address },
  } = useWeb3Context();

  const { data: character = {} } = useCharacter(characterId);

  const { data: tokens = 0 } = useTokens(characterId);

  return (
    <Box display="flex" mb={5} justifyContent="space-between">
      <Box mr={2}>
        <Text fontWeight="bold">Name</Text>
        <Text mb={2}>{character.name}</Text>
      </Box>

      <Box mx={2}>
        <Text fontWeight="bold">Level</Text>
        <Text mb={2}>
          {character.level?.toString()}{" "}
          {character.skillPoints ? `(${character.skillPoints})` : null}
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
    </Box>
  );
};

export default CharacterBar;
