import {
  Box,
  Button,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
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
import useCharacter from "../components/hooks/useCharacter";
import useTokens from "../components/hooks/useTokens";

const SimpleCharacterBar = ({ characterId }) => {
  const { data: character } = useCharacter(characterId);
  const { data: tokens } = useTokens(characterId);
  console.log({ tokens });
  return (
    <>
      <Td>{character?.name}</Td>
      <Td>{tokens ? ethers.utils.formatEther(tokens.toString()) : 0}</Td>
      <Td>
        {character?.energy?.current.toString()} /{" "}
        {character?.energy?.equippedMax.toString()}
      </Td>
      <Td>
        {character?.stamina?.current.toString()} /{" "}
        {character?.stamina?.equippedMax.toString()}
      </Td>
      <Td>
        {character?.health?.current.toString()} /{" "}
        {character?.health?.equippedMax.toString()}
      </Td>
      <Td>
        {character?.attack?.equippedMax.toString()} /{" "}
        {character?.defense?.equippedMax.toString()}
      </Td>
      <Td>
        <RouterLink href={`/game/characters/${characterId}`} passHref>
          <Button as="a" variant="outline">
            Control
          </Button>
        </RouterLink>
      </Td>
    </>
  );
};
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

  return <SimpleCharacterBar characterId={characterId?.toString()} />;
};

const CharacterView = () => {
  const {
    web3State: { signer, address },
  } = useWeb3Context();

  const {
    data: characterCount = BigNumber.from(0),
    refetch,
    status: characterCountStatus,
  } = useQuery(["characters", address], async () => {
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
  });

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

  if (characterCountStatus === "loading") {
    return null;
  }

  return (
    <Box mb={10}>
      <Table mb={5}>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Monies</Th>
            <Th>Energy</Th>
            <Th>Stamina</Th>
            <Th>Health</Th>
            <Th>Atk/Def</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {Array.from(Array(characterCount.toNumber())).map(
            (i, ownerCharacterIndex) => {
              return (
                <Tr key={ownerCharacterIndex}>
                  <CharacterRow ownerCharacterIndex={ownerCharacterIndex} />
                </Tr>
              );
            }
          )}
        </Tbody>
      </Table>
      <Text mb="2">Character Count: {characterCount?.toString()}</Text>
      <Button onClick={createCharacter}>Create character</Button>
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
