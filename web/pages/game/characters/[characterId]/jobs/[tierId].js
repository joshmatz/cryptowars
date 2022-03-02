import {
  Box,
  Button,
  Input,
  Progress,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useMutation } from "react-query";
import GameTemplate from "../../../../../components/modules/GameTemplate";

import jobTiers from "../../../../../constants/jobs";
import useJobsContract from "../../../../../components/hooks/useJobsContract";
import useCharacterJobExperience from "../../../../../components/hooks/useCharacterJobExperience";
import useCharacter from "../../../../../components/hooks/useCharacter";
import formatNumber from "../../../../../utils/formatNumber";
import { useRef, useState } from "react";
import JobTierList from "../../../../../components/modules/JobTierList";

// TODO: The first job in tier 0 is not showing mastery progress
const JobRow = ({ job, tierId, jobIndex, characterId }) => {
  const jobsContract = useJobsContract();
  const jobRef = useRef();
  const toast = useToast();
  const [jobRuns, setJobRuns] = useState(1);
  const { data: character, refetch: refetchCharacter } =
    useCharacter(characterId);

  const { data: jobExperience, refetch: refetchJobExperience } =
    useCharacterJobExperience(characterId, tierId, jobIndex);

  const { mutate: completeJob, isLoading } = useMutation(
    async () => {
      let tx;
      try {
        tx = await jobsContract.completeJob(
          characterId,
          tierId,
          jobIndex,
          jobRuns
        );
      } catch (e) {
        if ((e.code = -32603)) {
          return;
        }
        toast({
          title: "Error",
          description: e.data?.message || e.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
      jobRef.current = toast({
        id: `job-${tierId}-${jobIndex}`,
        title: `${job.name} in progress...`,
        description: `Get that bag.`,
        status: "info",
        duration: null,
        isClosable: true,
      });

      await tx.wait(1);

      toast({
        title: "Job successful!",
        description: "Now, back to hacking.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      toast.close(jobRef.current);
      return;
    },
    {
      onSuccess: () => {
        refetchCharacter();
        refetchJobExperience();
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
      >
        <Box
          flex="1 0 auto"
          width="50%"
          mr="5"
          opacity={jobExperience?.total?.toNumber() ? 1 : 0.5}
        >
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
            character.energy.adjustedCurrent.lt(job.energy) || isLoading
          }
          onClick={completeJob}
        >
          {character.energy.adjustedCurrent.lt(job.energy)
            ? `${BigNumber.from(job.energy)
                .sub(character.energy.adjustedCurrent)
                .toString()} Energy needed`
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
  if (!tierId) {
    return null;
  }

  const jobs = jobTiers[tierId].jobs;
  if (!jobs) {
    return <Box>No jobs</Box>;
  }

  return (
    <GameTemplate characterId={characterId}>
      <Text mb={10}>
        Master these jobs to move on to bigger and greater things.
      </Text>
      <JobTierList selectedIndex={tierId}>
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
      </JobTierList>
    </GameTemplate>
  );
};

export default JobTierPage;
