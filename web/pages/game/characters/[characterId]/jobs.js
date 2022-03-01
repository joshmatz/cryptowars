import { useRouter } from "next/router";
import useJobsContract from "../../../../components/hooks/useJobsContract";
import { useQuery } from "react-query";

const JobsPage = () => {
  const router = useRouter();
  const {
    query: { characterId },
  } = router;
  const jobContract = useJobsContract();
  const { data: unlockedJobTiers, status } = useQuery(
    `unlockedJobTiers-${characterId}`,
    () => jobContract.characterJobTier(characterId),
    {
      enabled: !!jobContract,
    }
  );

  if (status === "loading") {
    return null;
  } else {
    router.push(`/game/characters/${characterId}/jobs/${unlockedJobTiers}`);
    return null;
  }
};

export default JobsPage;
