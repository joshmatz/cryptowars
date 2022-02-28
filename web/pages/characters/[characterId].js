import { Link } from "@chakra-ui/react";
import { useRouter } from "next/router";

import RouterLink from "next/link";
import GameTemplate from "../../components/modules/GameTemplate";

const CharacterPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;

  return <GameTemplate characterId={characterId}></GameTemplate>;
};

export default CharacterPage;
