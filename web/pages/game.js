import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import RouterLink from "next/link";
import { useMutation, useQuery } from "react-query";
import GameTemplate from "../components/modules/GameTemplate";
import { useWeb3Context } from "../components/Web3ContextProvider";
import { CharacterContractAddress } from "../constants/game";
import useCharacter from "../components/hooks/useCharacter";
import useCharacterTokens from "../components/hooks/useCharacterTokens";
import CharacterContractAbi from "../constants/contracts/CharacterContractAbi";
import useContractMutation from "../components/hooks/useContractMutation";
import formatNumber from "../utils/formatNumber";

const SimpleCharacterBar = ({ characterId }) => {
  const { data: character } = useCharacter(characterId);
  const { data: tokens } = useCharacterTokens(characterId);

  return (
    <>
      <Td fontSize="sm">
        {character?.name} (L
        {formatNumber(character?.level.toString(), { style: "normal" })})
      </Td>
      <Td fontSize="sm">${formatNumber(tokens)}</Td>
      <Td fontSize="sm">
        {formatNumber(character?.energy?.adjustedCurrent.toString(), {
          style: "normal",
        })}{" "}
        /{" "}
        {formatNumber(character?.energy?.equippedMax.toString(), {
          style: "normal",
        })}
      </Td>
      <Td fontSize="sm">
        {formatNumber(character?.stamina?.adjustedCurrent.toString(), {
          style: "normal",
        })}{" "}
        /{" "}
        {formatNumber(character?.stamina?.equippedMax.toString(), {
          style: "normal",
        })}
      </Td>
      <Td fontSize="sm">
        {formatNumber(character?.health?.adjustedCurrent.toString(), {
          style: "normal",
        })}{" "}
        /{" "}
        {formatNumber(character?.health?.equippedMax.toString(), {
          style: "normal",
        })}
      </Td>
      <Td fontSize="sm">
        {formatNumber(character?.attack?.equippedMax.toString(), {
          style: "normal",
        })}{" "}
        /{" "}
        {formatNumber(character?.defense?.equippedMax.toString(), {
          style: "normal",
        })}
      </Td>
      <Td>
        <RouterLink href={`/game/characters/${characterId}`} passHref>
          <Button size="sm" as="a" variant="outline">
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
      console.error(e);
    }
    return characters;
  });

  const { mutate: createCharacter } = useContractMutation(
    () => {
      const name = prompt("Name your character -- you cannot change this.");
      if (!name) {
        throw new Error("Cancelled");
      }
      const characterContract = new ethers.Contract(
        CharacterContractAddress,
        CharacterContractAbi,
        signer
      );
      return characterContract.create(name, 0);
    },
    {
      notificationSuccess: {
        title: "Excellent work.",
        description: "Now, down to business.",
      },
      notificationProgress: {
        title: "Creating character...",
        description: "This will be my most beautiful work.",
      },
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
