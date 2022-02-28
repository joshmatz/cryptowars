import { ethers } from "ethers";
import { useMemo } from "react";
import { useWeb3Context } from "../Web3ContextProvider";
import {
  CharacterContractAbi,
  CharacterContractAddress,
} from "../../constants/game";

const useCharacterContract = () => {
  const {
    web3State: { signer, isCorrectChain },
  } = useWeb3Context();

  const characterContract = useMemo(() => {
    if (!signer || !isCorrectChain) {
      return null;
    }
    const _pc = new ethers.Contract(
      CharacterContractAddress,
      CharacterContractAbi,
      signer
    );
    return _pc;
  }, [signer, isCorrectChain]);

  return characterContract;
};

export default useCharacterContract;
