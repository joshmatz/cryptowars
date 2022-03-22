import {
  Box,
  Button,
  Container,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import Head from "next/head";
import RouterLink from "next/link";
import { useRouter } from "next/router";
import { useWeb3Context } from "../Web3ContextProvider";
import NetworkButtons from "./NetworkButtons";
import ChainCheckModal from "./ChainCheckModal";
import CharacterBar from "./CharacterBar";
import useJobsContract from "../hooks/useJobsContract";
import { useQuery } from "react-query";
import useCharacter from "../hooks/useCharacter";
import Footer from "./Footer";

const GameNavigation = () => {
  const router = useRouter();
  const {
    query: { characterId },
    asPath,
  } = router;
  const { contract: jobContract } = useJobsContract();
  const { data: unlockedJobTiers } = useQuery(
    `unlockedJobTiers-${characterId}`,
    () => jobContract.characterJobTier(characterId),
    {
      enabled: !!jobContract && !!characterId,
    }
  );

  let jobTierUnlocked = unlockedJobTiers?.toNumber();
  if (jobTierUnlocked === 9) {
    jobTierUnlocked = 8;
  }

  const navLinks = [
    {
      href: `/game/characters/${characterId}`,
      label: "Home",
    },
    {
      base: `/game/characters/${characterId}/jobs/`,
      href: `/game/characters/${characterId}/jobs/${jobTierUnlocked}`,
      label: "Jobs",
    },
    {
      href: `/game/characters/${characterId}/properties`,
      label: "Properties",
    },
    {
      href: `/game/characters/${characterId}/fight`,
      label: "Fight",
    },
    {
      href: `/game/characters/${characterId}/inventory`,
      label: "Inventory",
    },
    {
      href: `/game/characters/${characterId}/store`,
      label: "Store",
    },
  ];

  return (
    <Box display="flex" mb={5}>
      <Box>
        {navLinks.map((item) => {
          let isSelected = asPath === item.href;
          if (!isSelected && item.base) {
            isSelected = asPath.indexOf(item.base) === 0;
          }
          return (
            <RouterLink passHref href={item.href} key={item.href}>
              <Button as="a" variant={isSelected ? undefined : "ghost"}>
                {item.label}
              </Button>
            </RouterLink>
          );
        })}
      </Box>
    </Box>
  );
};

const GameTemplate = ({ children, characterId }) => {
  const {
    connect,
    web3State: { isInitializing, isCorrectChain, connected } = {},
  } = useWeb3Context();
  const {
    data: character,
    status: characterStatus,
    refetch,
  } = useCharacter(characterId);

  if (isInitializing) {
    return <Box />;
  }

  if (characterId && !characterStatus === "loading") {
    return null;
  }

  let message = "Your wallet has disconnected.";
  let action = "Switch";

  if (!connected) {
    message = "Connect your wallet to begin.";
    action = "Connect";
  }

  if (!isCorrectChain || !connected) {
    return (
      <Modal isOpen>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Box p={5} textAlign="center">
              <Text mb={5}>{message}</Text>
              <Button onClick={connect}>
                {action} to {process.env.NEXT_PUBLIC_NETWORK_NAME}
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (characterId && !character) {
    return (
      <Modal isOpen>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Box p={5} textAlign="center">
              <Text mb={5}>This character ain{"'"}t exist, bud.</Text>
              <RouterLink passHref href="/game">
                <Button as="a">Go home and try again</Button>
              </RouterLink>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <>
      <Head>
        <title>CryptoWars</title>
      </Head>
      <Container maxW="container.xl" pt={5}>
        <Box
          mb={{ base: 2, md: 5 }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box display="flex" alignItems="center">
            <RouterLink href="/game" passHref>
              <Link fontSize="3xl" fontFamily={"heading"} mr={2}>
                CryptoWars
              </Link>
            </RouterLink>
          </Box>
          <NetworkButtons />
        </Box>
      </Container>
      <Container maxW="container.xl">
        {characterId ? (
          <>
            <CharacterBar characterId={characterId} />
            <GameNavigation characterId={characterId} />
          </>
        ) : null}
        <Box mb={10}>{children}</Box>
      </Container>
      <ChainCheckModal />
    </>
  );
};

export default GameTemplate;
