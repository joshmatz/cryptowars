import { Box, Button, Link } from "@chakra-ui/react";
import Head from "next/head";
import RouterLink from "next/link";
import { useRouter } from "next/router";
import { useWeb3Context } from "../Web3ContextProvider";
import NetworkButtons from "./NetworkButtons";
import ChainCheckModal from "./ChainCheckModal";
import CharacterBar from "./CharacterBar";

const GameNavigation = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  return (
    <Box display="flex">
      <Box>
        <RouterLink href={`/characters/${characterId}`}>
          <Link as={Button} variant="ghost">
            Home
          </Link>
        </RouterLink>
        <RouterLink href={`/characters/${characterId}/properties`}>
          <Link as={Button} variant="ghost">
            Properties
          </Link>
        </RouterLink>
        <RouterLink href={`/characters/${characterId}/jobs`}>
          <Link as={Button} variant="ghost">
            Jobs
          </Link>
        </RouterLink>
        <RouterLink href={`/characters/${characterId}/fight`}>
          <Link as={Button} variant="ghost">
            Fight
          </Link>
        </RouterLink>
        <RouterLink href={`/characters/${characterId}/inventory`}>
          <Link as={Button} variant="ghost">
            Inventory
          </Link>
        </RouterLink>
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
    <Box p={5}>
      <Head>
        <title>CryptoWars</title>
      </Head>
      <NetworkButtons />
      {characterId ? (
        <>
          <CharacterBar />
          <GameNavigation />
        </>
      ) : null}

      {children}
      <ChainCheckModal />
    </Box>
  );
};

export default GameTemplate;
