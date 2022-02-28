import { Box, Button, Progress, Text } from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import GameTemplate from "../../../../../components/modules/GameTemplate";

import jobTiers from "../../../../../constants/jobs";
import useJobsContract from "../../../../../components/hooks/useJobsContract";
import useCharacterJobExperience from "../../../../../components/hooks/useCharacterJobExperience";
import useCharacter from "../../../../../components/hooks/useCharacter";

const JobRow = ({ job, tierId, jobIndex, characterId }) => {
  const jobsContract = useJobsContract();

  const { data: character } = useCharacter(characterId);
  const { mutate: completeJob } = useMutation(async () => {
    const tx = await jobsContract.completeJob(characterId, tierId, jobIndex);
    await tx.wait(1, 0, 0, 60);
    return;
  });

  const { data: jobExperience } = useCharacterJobExperience(
    characterId,
    tierId,
    jobIndex
  );

  console.log({
    jobIndex,
    total: jobExperience?.total,
    level: jobExperience?.level.toString(),
    expPerTier: job.experiencePerTier,
    percent: jobExperience?.total
      .mul(100)
      .div(job.experiencePerTier)
      .toNumber(),
  });

  return (
    <Box
      display="flex"
      justifyContent={"space-between"}
      alignItems="center"
      mb={5}
    >
      <Box>
        <Text fontWeight="bold">{job.name}</Text>
        <Text>
          {job.energy.toString()} Energy / $
          {ethers.utils.formatEther(job.payout)} / {job.experience}XP
        </Text>
      </Box>

      <Box display="flex" alignItems="center">
        <Box
          width="300px"
          mr="5"
          opacity={jobExperience?.total?.toNumber() ? 1 : 0.5}
        >
          <Progress
            size="lg"
            value={jobExperience?.total
              .mul(100)
              .div(job.experiencePerTier)
              .toNumber()}
          />
          <Text>
            Next mastery:{" "}
            {jobExperience?.total.toNumber()
              ? job.experiencePerTier - jobExperience?.total.toNumber()
              : ""}
            XP
          </Text>
        </Box>
        <Button
          disabled={character?.energy.current.lt(job.energy)}
          onClick={completeJob}
        >
          Complete
        </Button>
      </Box>
    </Box>
  );
};

const JobTierPage = () => {
  const router = useRouter();
  const {
    query: { tierId, characterId },
  } = router;
  if (!tierId) {
    return null;
  }

  console.log({ router });

  const jobs = jobTiers[tierId].jobs;
  if (!jobs) {
    return <Box>No jobs</Box>;
  }

  return (
    <GameTemplate characterId={characterId}>
      {jobs.map((job, i) => {
        return (
          <JobRow
            characterId={characterId}
            job={job}
            tierId={tierId}
            jobIndex={i}
            key={i}
          />
        );
      })}
    </GameTemplate>
  );
};

export default JobTierPage;
