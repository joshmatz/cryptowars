import { ethers } from "ethers";
import React, { useMemo } from "react";
import { useWeb3Context } from "../Web3ContextProvider";
import { JobsContractAddress } from "../../constants/game";
import JobsContractAbi from "../../constants/contracts/JobsContractAbi";

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
