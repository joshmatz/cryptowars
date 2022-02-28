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
  const { web3State: { isCorrectChain } = {}, connect } = useWeb3Context();

  return (
    <>
      <Modal isOpen={!isCorrectChain}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Box p={5} textAlign="center">
              <Text mb={5}>Your wallet has disconnected.</Text>
              <Button onClick={connect}>Switch to Hardhat</Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ChainCheckModal;
