import { Box, Button, Text } from "@chakra-ui/react";
import { useWeb3Context } from "../Web3ContextProvider";

const HOSTED_NETWORK = 1337;
const NETWORK_NAME = "Hardhat";

var truncate = function (fullStr, strLen, separator) {
  if (fullStr.length <= strLen) return fullStr;

  separator = separator || "...";

  var sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil((charsToShow + 2) / 2),
    backChars = Math.floor(charsToShow / 2);

  return (
    fullStr.substr(0, frontChars) +
    separator +
    fullStr.substr(fullStr.length - backChars)
  );
};

const ConnectButton = () => {
  const { connect, web3State } = useWeb3Context();

  if (web3State.network?.chainId !== HOSTED_NETWORK) {
    return (
      <Button onClick={connect} variant="outline">
        Wrong Network
      </Button>
    );
  }

  return web3State.address ? (
    <Button variant="outline">{truncate(web3State.address, 13)}</Button>
  ) : (
    <Button variant="outline" onClick={connect}>
      Connect
    </Button>
  );
};

const NetworkButtons = () => {
  return (
    <Box>
      <Button mr="2" variant="outline">
        {NETWORK_NAME}
      </Button>
      <ConnectButton />
    </Box>
  );
};

export default NetworkButtons;
