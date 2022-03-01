import {
  Box,
  Button,
  Circle,
  Divider,
  Icon,
  Link,
  Progress,
  Square,
  Stack,
  Text,
  useColorModePreference,
  useColorModeValue,
} from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import GameTemplate from "../../../../../components/modules/GameTemplate";
import { BsCheckCircleFill, BsCheckCircle } from "react-icons/bs";

import jobTiers from "../../../../../constants/jobs";
import useJobsContract from "../../../../../components/hooks/useJobsContract";
import useCharacterJobExperience from "../../../../../components/hooks/useCharacterJobExperience";
import useCharacter from "../../../../../components/hooks/useCharacter";
import RouterLink from "next/link";
import { FaCircle } from "react-icons/fa";
import { AiOutlineCheckSquare, AiFillCheckSquare } from "react-icons/ai";
import formatNumber from "../../../../../utils/formatNumber";
const tierNames = ["Bitconnect", "Pincoin", "ACChain", "Savedroid", "PlexCoin"];

const TierTemplate = ({ characterId, tierIndex, selectedIndex }) => {
  const jobContract = useJobsContract();
  const { data: unlockedJobTiers } = useQuery(
    `unlockedJobTiers-${characterId}`,
    () => jobContract.characterJobTier(characterId),
    {
      enabled: !!jobContract,
    }
  );

  const jobTierUnlocked = unlockedJobTiers?.toNumber();

  const isUnlocked = jobTierUnlocked > tierIndex;
  const unlockedColor = useColorModeValue("blue.400", "blue.600");
  const lockedColor = useColorModeValue("gray.600", "gray.500");
  const isSelectedIndex = selectedIndex === tierIndex.toString();

  return (
    <Stack direction="column" flex="1">
      <Stack direction="row" alignItems="center" spacing={0}>
        <Divider
          bg={isUnlocked || isSelectedIndex ? unlockedColor : lockedColor}
        />
        <Square
          sx={{ marginInlineStart: 0 }}
          size="40px"
          bg={isUnlocked || isSelectedIndex ? unlockedColor : lockedColor}
        >
          <Icon
            w={5}
            h={5}
            as={
              isSelectedIndex
                ? FaCircle
                : isUnlocked
                ? AiFillCheckSquare
                : AiOutlineCheckSquare
            }
          />
        </Square>
        <Divider bg={isUnlocked ? unlockedColor : lockedColor} />
      </Stack>
      <Stack alignItems="center">
        <Text fontWeight={isSelectedIndex ? "bold" : ""}>
          {isUnlocked ? (
            <RouterLink
              passHref
              href={`/game/characters/${characterId}/jobs/${tierIndex}`}
            >
              <Link>{tierNames[tierIndex]}</Link>
            </RouterLink>
          ) : (
            tierNames[tierIndex]
          )}
        </Text>
      </Stack>
    </Stack>
  );
};

const TierList = ({ characterId, children, selectedIndex }) => {
  return (
    <Box>
      <Stack direction={"row"} align="stretch" mb={10} spacing={0}>
        {jobTiers.map((tier, i) => {
          return (
            <TierTemplate
              selectedIndex={selectedIndex}
              characterId={characterId}
              tierIndex={i}
              key={i}
            />
          );
        })}
      </Stack>
      {children}
    </Box>
  );
};

// TODO: The first job in tier 0 is not showing mastery progress
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

  if (!character) {
    return null;
  }

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
          {job.energy.toString()} Energy / ${formatNumber(job.payout)} /{" "}
          {job.experience}XP
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
          disabled={character.energy.adjustedCurrent.lt(job.energy)}
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

  const jobs = jobTiers[tierId].jobs;
  if (!jobs) {
    return <Box>No jobs</Box>;
  }

  return (
    <GameTemplate characterId={characterId}>
      <TierList selectedIndex={tierId}>
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
      </TierList>
    </GameTemplate>
  );
};

export default JobTierPage;
