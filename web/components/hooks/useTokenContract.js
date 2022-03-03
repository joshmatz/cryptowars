import { ethers } from "ethers";
import { useMemo } from "react";
import { useWeb3Context } from "../Web3ContextProvider";
import { TokenContractAddress } from "../../constants/game";
import TokenContractAbi from "../../constants/contracts/TokenContractAbi";

const useTokenContract = () => {
  const {
    web3State: { signer, isCorrectChain },
  } = useWeb3Context();

  const tokenContract = useMemo(() => {
    if (!signer || !isCorrectChain) {
      return null;
    }
    const _pc = new ethers.Contract(
      TokenContractAddress,
      TokenContractAbi,
      signer
    );
    return _pc;
  }, [signer, isCorrectChain]);

  return tokenContract;
};

export default useTokenContract;
