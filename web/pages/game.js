import { Box, Button, Link, Text } from "@chakra-ui/react";
import axios from "axios";
import { BigNumber, ethers, Signer } from "ethers";
import RouterLink from "next/link";
import { useMutation, useQuery } from "react-query";
import NetworkButtons from "../components/modules/NetworkButtons";
import GameTemplate from "../components/modules/GameTemplate";
import { useWeb3Context } from "../components/Web3ContextProvider";
import {
  CharacterContractAbi,
  CharacterContractAddress,
} from "../constants/game";

const CharacterRow = ({ ownerCharacterIndex }) => {
  const {
    web3State: { signer, address },
  } = useWeb3Context();

  const { data: characterId } = useQuery(
    ["ownerCharacterIndex", address, ownerCharacterIndex],
    async () => {
      const characterContract = new ethers.Contract(
        CharacterContractAddress,
        CharacterContractAbi,
        signer
      );
      let id;
      try {
        id = await characterContract.tokenOfOwnerByIndex(
          address,
          ownerCharacterIndex
        );
      } catch (e) {
        console.error(e);
      }
      return id;
    }
  );

  const { data: character = {} } = useQuery(
    ["characters", address, characterId?.toString()],
    async () => {
      const characterContract = new ethers.Contract(
        CharacterContractAddress,
        CharacterContractAbi,
        signer
      );
      let _character;
      try {
        _character = await characterContract.characters(characterId);
      } catch (e) {
        console.error(e);
      }

      return { ..._character };
    },
    {
      enabled: !!characterId,
    }
  );

  return (
    <Box>
      <RouterLink href={`characters/${characterId?.toString()}`}>
        <Link>
          {character.name} - {characterId?.toString()}
        </Link>
      </RouterLink>
    </Box>
  );
};

const CharacterView = () => {
  const {
    web3State: { signer, address },
  } = useWeb3Context();

  const { data: characterCount = BigNumber.from(0), refetch } = useQuery(
    ["characters", address],
    async () => {
      const characterContract = new ethers.Contract(
        CharacterContractAddress,
        CharacterContractAbi,
        signer
      );

      let characters;
      try {
        characters = await characterContract.balanceOf(address);
      } catch (e) {
        console.log(e);
      }
      return characters;
    }
  );

  const { mutate: createCharacter } = useMutation(
    async () => {
      const characterContract = new ethers.Contract(
        CharacterContractAddress,
        CharacterContractAbi,
        signer
      );
      const character = await characterContract.create("test", 0);
      await character.wait(1, 0, 0, 60);
      return character;
    },
    {
      onSuccess: refetch,
    }
  );

  return (
    <Box>
      <Text mb="2">Character Count: {characterCount?.toString()}</Text>
      <Button onClick={createCharacter}>Create character</Button>
      {Array.from(Array(characterCount.toNumber())).map(
        (i, ownerCharacterIndex) => {
          return (
            <CharacterRow
              ownerCharacterIndex={ownerCharacterIndex}
              key={ownerCharacterIndex}
            />
          );
        }
      )}
    </Box>
  );
};

export default function Home() {
  return (
    <GameTemplate>
      <CharacterView />
    </GameTemplate>
  );
}
