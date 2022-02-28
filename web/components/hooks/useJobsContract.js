import { ethers } from "ethers";
import { useMemo } from "react";
import { useWeb3Context } from "../Web3ContextProvider";
import { JobsContractAbi, JobsContractAddress } from "../../constants/game";

const useJobsContract = () => {
  const {
    web3State: { signer, isCorrectChain },
  } = useWeb3Context();

  const JobsContract = useMemo(() => {
    if (!signer || !isCorrectChain) {
      return null;
    }
    const _pc = new ethers.Contract(
      JobsContractAddress,
      JobsContractAbi,
      signer
    );
    return _pc;
  }, [signer, isCorrectChain]);

  return JobsContract;
};

export default useJobsContract;
