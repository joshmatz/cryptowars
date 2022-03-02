import { useRouter } from "next/router";

import GameTemplate from "../../../components/modules/GameTemplate";
import useCharacter from "../../../components/hooks/useCharacter";
import SkillPointBar from "../../../components/modules/SkillPointBar";
import WalletBar from "../../../components/modules/WalletBar";
import { Stack } from "@chakra-ui/react";

const CharacterPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  const { data: character, refetch } = useCharacter(characterId);

  if (!character) {
    return null;
  }

  return (
    <GameTemplate characterId={characterId}>
      <Stack
        direction={{ base: "column", lg: "row" }}
        justify="stretch"
        mb={10}
      >
        <WalletBar character={character} refetchCharacter={refetch} />
        <SkillPointBar character={character} refetchCharacter={refetch} />
      </Stack>
    </GameTemplate>
  );
};

export default CharacterPage;
