import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import formatNumber from "../../utils/formatNumber";
import { useMutation } from "react-query";
import useCharacterContract from "../../components/hooks/useCharacterContract";
import { useRef, useState } from "react";
import { AiFillPlusSquare } from "react-icons/ai";

const StatControl = ({ keyValue, label, state, setState }) => {
  return (
    <FormControl>
      <Grid templateColumns="repeat(12, 1fr)" gap={5} alignItems="center">
        <GridItem colSpan="3">
          <FormLabel fontSize="sm" htmlFor={keyValue}>
            {label}
          </FormLabel>
        </GridItem>

        <GridItem colSpan="9">
          <Stack direction="row" align="center">
            <Icon
              as={AiFillPlusSquare}
              w={5}
              h={5}
              onClick={() =>
                setState((newState) => ({
                  ...newState,
                  [keyValue]: parseInt(newState[keyValue], 10) + 1,
                }))
              }
            />
            <Input
              size="sm"
              flex="1 1 auto"
              id={keyValue}
              type="number"
              value={state[keyValue]}
              onChange={(e) =>
                setState((newState) => ({
                  ...newState,
                  [keyValue]: e.target.value,
                }))
              }
            />
          </Stack>
        </GridItem>
      </Grid>
    </FormControl>
  );
};

const SkillPointBar = ({ character, refetchCharacter }) => {
  const [state, setState] = useState({
    health: 0,
    energy: 0,
    stamina: 0,
    attack: 0,
    defense: 0,
  });
  const characterContract = useCharacterContract();
  const skillPointsRef = useRef();
  const toast = useToast();
  const { mutate: modifySkillPoints, isLoading } = useMutation(
    async () => {
      const tx = await characterContract.useSkillPoints(
        character.id,
        state.health || 0,
        state.energy || 0,
        state.stamina || 0,
        state.attack || 0,
        state.defense || 0
      );

      skillPointsRef.current = toast({
        id: `use-sp`,
        title: "The potion seems to be working...",
        description: `You'll be stronger soon.`,
        status: "info",
        duration: null,
        isClosable: true,
      });

      await tx.wait(1);

      toast({
        title: "Much success!",
        description: "Now, back to business.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      toast.close(skillPointsRef.current);
      return;
    },
    {
      onSuccess: () => {
        refetchCharacter();
      },
    }
  );

  if (!character.skillPoints?.toNumber()) {
    return (
      <Stack
        flex="1"
        p={5}
        borderWidth="1px"
        borderBottomWidth="3px"
        borderColor="gray.600"
      >
        <Text fontWeight="bold">Skill Points</Text>
        <Text fontSize="sm">Womp womp... No skill points available.</Text>
      </Stack>
    );
  }

  return (
    <Box
      flex="1"
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        modifySkillPoints();
      }}
      p={5}
      borderWidth="1px"
      borderBottomWidth="3px"
      borderColor="gray.600"
    >
      <Stack mb={5} gap={2}>
        <Text fontWeight="bold">Skill Points</Text>
        <Text fontSize="sm">
          {formatNumber(character.skillPoints, {
            isWei: false,
            style: "normal",
          })}{" "}
          skill points to spend. Spend wisely.
        </Text>
        <StatControl
          keyValue="health"
          label="Health"
          state={state}
          setState={setState}
        />
        <StatControl
          keyValue="energy"
          label="Energy"
          state={state}
          setState={setState}
        />
        <StatControl
          keyValue="stamina"
          label="Stamina"
          state={state}
          setState={setState}
        />
        <StatControl
          keyValue="attack"
          label="Attack"
          state={state}
          setState={setState}
        />
        <StatControl
          keyValue="defense"
          label="Defense"
          state={state}
          setState={setState}
        />
      </Stack>
      <Button size="sm" type="submit" width="100%" disabled={isLoading}>
        Gimme my stats!
      </Button>
    </Box>
  );
};

export default SkillPointBar;
