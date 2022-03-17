import { ethers } from "ethers";
import { useMemo } from "react";
import { useWeb3Context } from "../Web3ContextProvider";
import { ItemContractAddress } from "../../constants/game";
import ItemContractAbi from "../../constants/contracts/ItemContractAbi";

const useItemContract = () => {
  const {
    web3State: { signer, isCorrectChain },
  } = useWeb3Context();

  const ItemContract = useMemo(() => {
    if (!signer || !isCorrectChain) {
      return null;
    }
    const _pc = new ethers.Contract(
      ItemContractAddress,
      ItemContractAbi,
      signer
    );
    return _pc;
  }, [signer, isCorrectChain]);

  return ItemContract;
};

export default useItemContract;
