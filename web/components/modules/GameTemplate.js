import { Box, Button, Container, Link, Text } from "@chakra-ui/react";
import Head from "next/head";
import RouterLink from "next/link";
import { useRouter } from "next/router";
import { useWeb3Context } from "../Web3ContextProvider";
import NetworkButtons from "./NetworkButtons";
import ChainCheckModal from "./ChainCheckModal";
import CharacterBar from "./CharacterBar";
import useJobsContract from "../hooks/useJobsContract";
import { useQuery } from "react-query";

const GameNavigation = () => {
  const router = useRouter();
  const {
    query: { characterId },
    asPath,
  } = router;
  const jobContract = useJobsContract();
  const { data: unlockedJobTiers } = useQuery(
    `unlockedJobTiers-${characterId}`,
    () => jobContract.characterJobTier(characterId),
    {
      enabled: !!jobContract && !!characterId,
    }
  );

  const jobTierUnlocked = unlockedJobTiers?.toNumber();

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
  const { web3State: { isInitializing } = {} } = useWeb3Context();
  if (isInitializing) {
    return <Box />;
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
            <RouterLink href="/" passHref>
              <Text fontSize="3xl" fontFamily={"heading"} mr={2}>
                CryptoWars
              </Text>
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
