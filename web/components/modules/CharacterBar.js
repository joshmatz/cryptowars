import { Box, FormLabel, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useWeb3Context } from "../Web3ContextProvider";
import useCharacter from "../hooks/useCharacter";
import useTokens from "../hooks/useTokens";

const CharacterBar = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  const {
    web3State: { address },
  } = useWeb3Context();

  const { data: character = {} } = useCharacter(address, characterId);

  const { data: tokens = 0 } = useTokens(address, characterId);

  return (
    <Box display="flex" mb={5}>
      <Box mr={2}>
        <FormLabel>Name</FormLabel>
        <Text mb={2}>{character.name}</Text>
      </Box>

      <Box mx={2}>
        <FormLabel>Level</FormLabel>
        <Text mb={2}>{character.level?.toString()}</Text>
      </Box>

      <Box mx={2}>
        <FormLabel>Experience</FormLabel>
        <Text mb={2}>{character.experience?.toString()}</Text>
      </Box>

      <Box mx={2}>
        <FormLabel>Monies</FormLabel>
        <Text mb={2}>
          ${!!tokens ? ethers.utils.formatEther(tokens) : null}
        </Text>
      </Box>

      <Box mx={2}>
        <FormLabel>Energy</FormLabel>
        <Text mb={2}>
          {character?.energy?.current?.toString()} /{" "}
          {character?.energy?.equippedMax?.toString()}
        </Text>
      </Box>

      <Box mx={2}>
        <FormLabel>Health</FormLabel>
        <Text mb={2}>
          {character?.health?.current?.toString()} /{" "}
          {character?.health?.equippedMax?.toString()}
        </Text>
      </Box>

      <Box mx={2}>
        <FormLabel>Attack</FormLabel>
        <Text mb={2}>
          {character?.attack?.current?.toString()} /{" "}
          {character?.attack?.equippedMax?.toString()}
        </Text>
      </Box>

      <Box mx={2}>
        <FormLabel>Defense</FormLabel>
        <Text mb={2}>
          {character?.defense?.current?.toString()} /{" "}
          {character?.defense?.equippedMax?.toString()}
        </Text>
      </Box>
    </Box>
  );
};

export default CharacterBar;
