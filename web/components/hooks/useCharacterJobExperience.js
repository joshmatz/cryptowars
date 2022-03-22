import { useQuery } from "react-query";
import useJobsContract from "./useJobsContract";

const useCharacterJobExperience = (characterId, tierId, jobId) => {
  const { contract: jobsContract } = useJobsContract();

  return useQuery(
    ["characterJobExperience", characterId, tierId, jobId],
    async () => {
      let _characterJobExperience = {};
      try {
        _characterJobExperience = await jobsContract.jobExperience(
          characterId,
          tierId,
          jobId
        );
      } catch (e) {
        // console.error(e);
      }

      return {
        level: _characterJobExperience.level,
        total: _characterJobExperience.total,
      };
    },
    {
      enabled: !!jobsContract && !!characterId && !!tierId,
    }
  );
};

export default useCharacterJobExperience;
