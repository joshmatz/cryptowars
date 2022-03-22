import {
  Box,
  Button,
  ButtonGroup,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  toast,
  useToast,
} from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useRef, useState } from "react";
import { BiPhone } from "react-icons/bi";
import { useMutation, useQuery } from "react-query";
import formatNumber from "../../utils/formatNumber";
import useTokenContract from "../hooks/useTokenContract";
import useWalletContract from "../hooks/useWalletContract";
import { useWeb3Context } from "../Web3ContextProvider";

const WalletBar = ({ character, refetchCharacter }) => {
  const {
    web3State: { address },
  } = useWeb3Context();
  const toast = useToast();
  const [action, setAction] = useState("Deposit");
  const [amount, setAmount] = useState(0);
  const tokenContract = useTokenContract();
  const { data: balance, refetch: refetchBalance } = useQuery(
    ["balance", address],
    () => tokenContract.balanceOf(address),
    { enabled: !!address }
  );

  const walletContract = useWalletContract();
  const walletRef = useRef();
  const { mutate: submitTransfer, isLoading } = useMutation(
    async () => {
      let tx;

      if (action === "Deposit") {
        try {
          tx = await walletContract.depositToCharacter(
            character.id,
            ethers.utils.parseEther(amount)
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
          return;
        }
        walletRef.current = toast({
          id: `wallet-${character.id}`,
          title: `Beedebopboopbeepbopdeepbop...`,
          description: `Here we go again...`,
          status: "info",
          duration: null,
          isClosable: true,
        });
      } else {
        try {
          tx = await walletContract.withdrawToPlayer(
            character.id,
            ethers.utils.parseEther(amount)
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
          return;
        }
        walletRef.current = toast({
          id: `wallet-${character.id}`,
          title: `Safeguarding funds now...`,
          description: `We didn't want to get hacked.`,
          status: "info",
          duration: null,
          isClosable: true,
        });
      }

      await tx.wait(1);

      toast({
        title: "Transfer complete!",
        description: "Now, back to hacking.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      toast.close(walletRef.current);

      setAmount("0");

      return;
    },
    {
      onSuccess: () => {
        refetchCharacter();
        refetchBalance();
      },
    }
  );

  if (!character?.id) {
    return null;
  }

  let fee = 0;

  if (action === "Withdraw") {
    fee = 0.15;
  }

  return (
    <Stack
      flex="1"
      p={5}
      borderWidth="1px"
      borderBottomWidth="3px"
      borderColor="gray.600"
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        submitTransfer();
      }}
      gap={2}
    >
      <Text fontWeight="bold">The Safe</Text>

      <Text fontSize="sm">
        You can deposit/withdraw funds from your character.
      </Text>

      <ButtonGroup size="sm" isAttached variant="outline" mb={5}>
        <Button
          mr="-px"
          isActive={action === "Deposit"}
          onClick={() => setAction("Deposit")}
        >
          Deposit to {character.name}
        </Button>
        <Button
          isActive={action === "Withdraw"}
          onClick={() => setAction("Withdraw")}
        >
          Withdraw from {character.name}
        </Button>
      </ButtonGroup>

      <InputGroup mb={5} size="sm">
        <InputLeftElement pointerEvents="none">
          <Text>$</Text>
        </InputLeftElement>
        <Input
          size="sm"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </InputGroup>

      {action === "Withdraw" ? (
        <Text mb={5} fontSize="sm">
          A{" "}
          <Text as="span" color="red.400">
            (${formatNumber(parseInt(amount, 10) * 0.15)})
          </Text>{" "}
          15% fee will be charged to transfer from {character.name} to your
          wallet.
        </Text>
      ) : null}

      <Stack
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
      >
        <Button
          size="sm"
          w={{ base: "full", md: "initial" }}
          disabled={isLoading || parseInt(amount, 10) === 0}
          type="submit"
        >
          {isLoading
            ? "..."
            : `${action} $
          ${formatNumber(parseInt(amount, 10) - parseInt(amount, 10) * fee)}`}
        </Button>
        <Text fontSize="sm">Balance: ${formatNumber(balance)}</Text>
      </Stack>
    </Stack>
  );
};

export default WalletBar;
