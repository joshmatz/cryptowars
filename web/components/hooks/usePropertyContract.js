import { ethers } from "ethers";
import React, { useMemo } from "react";
import { useWeb3Context } from "../Web3ContextProvider";
import { PropertiesContractAddress } from "../../constants/game";
import PropertiesContractAbi from "../../constants/contracts/PropertiesContractAbi";

const usePropertyContract = () => {
  const {
    web3State: { signer, isCorrectChain },
  } = useWeb3Context();

  const propertiesContract = useMemo(() => {
    if (!signer || !isCorrectChain) {
      return null;
    }
    const _pc = new ethers.Contract(
      PropertiesContractAddress,
      PropertiesContractAbi,
      signer
    );
    return _pc;
  }, [signer, isCorrectChain]);

  return propertiesContract;
};

export default usePropertyContract;
