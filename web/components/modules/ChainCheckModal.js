import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useWeb3Context } from "../Web3ContextProvider";

function ChainCheckModal() {
  const { web3State: { isCorrectChain, connected } = {}, connect } =
    useWeb3Context();

  let message = "Your wallet has disconnected.";
  let action = "Switch";

  if (!connected) {
    message = "Connect your wallet to begin.";
    action = "Connect";
  }

  return (
    <>
      <Modal isOpen={!isCorrectChain || !connected}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Box p={5} textAlign="center">
              <Text mb={5}>{message}</Text>
              <Button onClick={connect}>{action} to Hardhat</Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ChainCheckModal;
