import { Box, Button, Input, Progress, Stack, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import GameTemplate from "../../../../../components/modules/GameTemplate";

import jobTiers from "../../../../../constants/jobs";
import useJobsContract from "../../../../../components/hooks/useJobsContract";
import useCharacterJobExperience from "../../../../../components/hooks/useCharacterJobExperience";
import useCharacter from "../../../../../components/hooks/useCharacter";
import formatNumber from "../../../../../utils/formatNumber";
import { useState } from "react";
import JobTierList from "../../../../../components/modules/JobTierList";
import useContractMutation from "../../../../../components/hooks/useContractMutation";
import useCharacterTokens from "../../../../../components/hooks/useCharacterTokens";
import { useQueryClient } from "react-query";

const JobRow = ({ job, tierId, jobIndex, characterId }) => {
  const queryClient = useQueryClient();
  const jobsContract = useJobsContract();
  const [jobRuns, setJobRuns] = useState(1);
  const { data: character, refetch: refetchCharacter } =
    useCharacter(characterId);

  const { data: jobExperience, refetch: refetchJobExperience } =
    useCharacterJobExperience(characterId, tierId, jobIndex);

  const { data: tokens, refetch: refetchTokens } =
    useCharacterTokens(characterId);

  const { mutate: completeJob, isLoading } = useContractMutation(
    () => jobsContract.completeJob(characterId, tierId, jobIndex, jobRuns),
    {
      notificationProgress: {
        title: `${job.name} in progress...`,
        description: `Get that bag.`,
      },
      notificationSuccess: {
        title: "Job successful!",
        description: "Now, back to hacking.",
      },
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`unlockedJobTiers-${characterId}`);
        refetchCharacter();
        refetchJobExperience();
        refetchTokens();
      },
    }
  );

  if (!character) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection={{ base: "column", lg: "row" }}
      justifyContent={{ lg: "space-between" }}
      alignItems={{ lg: "center" }}
      mb={5}
      borderBottom="1px"
      borderColor="gray.700"
      pb="1"
    >
      <Box flex="1 0 50%" mb={{ base: 5, lg: 0 }}>
        <Text fontWeight="bold">{job.name}</Text>
        <Text>
          Use {job.energy.toString()} Energy | Earn ${formatNumber(job.payout)}{" "}
          + {job.experience}XP
        </Text>
      </Box>

      <Stack
        flex="1 0 50%"
        display="flex"
        alignItems="center"
        justifyContent={"space-between"}
        direction={{ base: "column", sm: "row" }}
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          completeJob();
        }}
      >
        <Box
          flex="1 0 auto"
          width="50%"
          mr="5"
          // opacity={jobExperience?.total?.toNumber() ? 1 : 0.5}
        >
          {jobExperience?.level.toNumber() === 3 ? (
            <Text>Mastery 3 Reached</Text>
          ) : (
            <>
              <Progress
                size="xs"
                mb={1}
                value={
                  (100 *
                    Math.round(
                      jobExperience?.total.toNumber() % job.experiencePerTier
                    )) /
                  job.experiencePerTier
                }
              />
              <Text>
                Mastery: {jobExperience?.level.toNumber()} | Next:{" "}
                {job.experiencePerTier
                  ? job.experiencePerTier -
                    (jobExperience?.total.toNumber() % job.experiencePerTier)
                  : 0}
                XP
              </Text>
            </>
          )}
        </Box>
        {character.energy.adjustedCurrent.lt(job.energy) ? null : (
          <Input
            type="number"
            value={jobRuns}
            onChange={(e) => setJobRuns(e.target.value)}
          />
        )}

        <Button
          flex="1 0 auto"
          disabled={
            character.energy.adjustedCurrent.lt(job.energy * jobRuns) ||
            isLoading
          }
          type="submit"
        >
          {character.energy.adjustedCurrent.lt(job.energy * jobRuns)
            ? `-${BigNumber.from(job.energy * jobRuns)
                .sub(character.energy.adjustedCurrent)
                .toString()} Energy`
            : isLoading
            ? "..."
            : "Complete"}
        </Button>
      </Stack>
    </Box>
  );
};

const JobTierPage = () => {
  const router = useRouter();
  const {
    query: { tierId, characterId },
  } = router;

  const jobs = jobTiers[tierId].jobs;

  if (!jobs) {
    return <Box>No jobs</Box>;
  }

  return (
    <GameTemplate characterId={characterId}>
      <Text mb={10}>
        Master these jobs to move on to bigger and greater things.
      </Text>
      <JobTierList selectedIndex={tierId} characterId={characterId}>
        {jobs.map((job, i) => {
          return (
            <JobRow
              characterId={characterId}
              job={job}
              tierId={tierId}
              jobIndex={i}
              key={`${tierId}-${i}`}
            />
          );
        })}
      </JobTierList>
    </GameTemplate>
  );
};

export default JobTierPage;
