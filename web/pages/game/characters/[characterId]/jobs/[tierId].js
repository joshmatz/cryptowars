import {
  Box,
  Button,
  Input,
  Progress,
  Stack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useToast,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import GameTemplate from "../../../../../components/modules/GameTemplate";

import useJobsContract from "../../../../../components/hooks/useJobsContract";
import useCharacterJobExperience from "../../../../../components/hooks/useCharacterJobExperience";
import useCharacter from "../../../../../components/hooks/useCharacter";
import formatNumber from "../../../../../utils/formatNumber";
import { useState } from "react";
import JobTierList from "../../../../../components/modules/JobTierList";
import useContractMutation from "../../../../../components/hooks/useContractMutation";
import useCharacterTokens from "../../../../../components/hooks/useCharacterTokens";
import { useQueryClient } from "react-query";
import { jobTiers } from "shared/utils/jobs";
import ClassIcon from "../../../../../components/modules/ItemClassIcon";
import { getItemTypeId, itemTypes } from "shared/utils/items";
import useItemListener from "../../../../../components/hooks/useItemListener";
import { useWeb3Context } from "../../../../../components/Web3ContextProvider";

const gasLimitPerJob = 205000;
const JobRow = ({ job, tierId, jobIndex, characterId }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { contract: jobsContract, abi: jobsAbi } = useJobsContract();
  const [jobRuns, setJobRuns] = useState(1);
  const { data: character, refetch: refetchCharacter } =
    useCharacter(characterId);

  const { data: jobExperience, refetch: refetchJobExperience } =
    useCharacterJobExperience(characterId, tierId, jobIndex);

  const { data: tokens, refetch: refetchTokens } =
    useCharacterTokens(characterId);

  const { mutate: completeJob, isLoading } = useContractMutation(
    () =>
      jobsContract.completeJob(characterId, tierId, jobIndex, jobRuns, {
        gasLimit: gasLimitPerJob * jobRuns,
      }),
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

  const requiredItems = job.requiredItemTypeNames.map((itemTypeName, i) => {
    return {
      name: itemTypeName,
      amount: job.requiredItemTypeCounts[i],
    };
  });

  if (!character) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection={{ base: "column", lg: "row" }}
      justifyContent={{ lg: "space-between" }}
      alignItems={{ lg: "flex-end" }}
      mb={5}
      borderBottom="1px"
      borderColor="gray.700"
      pb="2"
    >
      <Box
        width={{ base: "full", lg: "50%" }}
        mb={{ base: 5, lg: 0 }}
        pr={{ base: 0, lg: 5 }}
      >
        <Stack>
          <Text fontWeight="bold">{job.name}</Text>

          <Stack direction="row" wrap>
            <Text fontSize="sm">Use: </Text>
            <Tag size="sm" title={`${job.energy.toString()} Energy`}>
              <TagLabel>{job.energy.toString()} Energy</TagLabel>
            </Tag>
            {job.requiredItemTypeNames.map((itemTypeName, i) => {
              const itemType = itemTypes[getItemTypeId(itemTypeName)];
              return (
                <Tag
                  key={itemType.name}
                  size="sm"
                  title={`${job.requiredItemTypeCounts[i]}x ${itemType.name}`}
                >
                  {itemType.class === 6 ? (
                    <TagLeftIcon
                      as={() => (
                        <ClassIcon mt={0} mr={1} classId={itemType.class} />
                      )}
                    />
                  ) : null}
                  <TagLabel>
                    {job.requiredItemTypeCounts[i]}x {itemType.name}
                  </TagLabel>
                </Tag>
              );
            })}
          </Stack>
          <Stack direction="row" wrap>
            <Text fontSize="sm">Earn: </Text>
            <Tag size="sm" title={`$${formatNumber(job.payout)}`}>
              <TagLabel>${formatNumber(job.payout)}</TagLabel>
            </Tag>
            <Tag size="sm" title={`${job.experience}XP`}>
              <TagLabel>{job.experience}XP</TagLabel>
            </Tag>
            {job.rewardItemTypeNames.map((itemTypeName, i) => {
              const itemType = itemTypes[getItemTypeId(itemTypeName)];
              return (
                <Tag
                  key={itemType.name}
                  size="sm"
                  variant="outline"
                  title={itemType.name}
                >
                  <TagLabel>{itemType.name}</TagLabel>
                </Tag>
              );
            })}
          </Stack>
        </Stack>
      </Box>

      <Stack
        flex="1 0 50%"
        display="flex"
        alignItems="flex-end"
        direction={{ base: "column" }}
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          completeJob();
        }}
      >
        {jobExperience?.level.toNumber() === 3 ? (
          <Text fontSize="sm">Maximum Mastery</Text>
        ) : (
          <Stack>
            <Text fontSize="sm">
              Mastery: {jobExperience?.level.toNumber()} | Next:{" "}
              {job.experiencePerTier
                ? job.experiencePerTier -
                  formatNumber(
                    jobExperience?.total.toNumber() % job.experiencePerTier,
                    { style: "normal" }
                  )
                : 0}
              XP
            </Text>
            <Progress
              size="xs"
              value={
                (100 *
                  Math.round(
                    jobExperience?.total.toNumber() % job.experiencePerTier
                  )) /
                job.experiencePerTier
              }
            />
          </Stack>
        )}
        <Stack direction="row">
          {character.energy.adjustedCurrent.lt(job.energy) ? null : (
            <Input
              type="number"
              value={jobRuns}
              onChange={(e) => setJobRuns(e.target.value)}
              min="1"
              max="150"
              size="sm"
            />
          )}

          <Button
            flex="1 0 auto"
            disabled={
              character.energy.adjustedCurrent.lt(job.energy * jobRuns) ||
              isLoading
            }
            type="submit"
            size="sm"
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
      </Stack>
    </Box>
  );
};

const JobTierPage = () => {
  const router = useRouter();
  const {
    query: { tierId, characterId },
  } = router;

  const { web3State } = useWeb3Context();
  useItemListener(web3State.address);

  const jobs = jobTiers[tierId]?.jobs;

  if (!jobs) {
    return <Box>404: No jobs</Box>;
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
