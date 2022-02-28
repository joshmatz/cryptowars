import { ethers } from "ethers";
import { useMemo } from "react";
import { useWeb3Context } from "../Web3ContextProvider";
import { WalletContractAbi, WalletContractAddress } from "../../constants/game";

const useWalletContract = () => {
  const {
    web3State: { signer, isCorrectChain },
  } = useWeb3Context();

  const walletContract = useMemo(() => {
    if (!signer || !isCorrectChain) {
      return null;
    }

    const _wc = new ethers.Contract(
      WalletContractAddress,
      WalletContractAbi,
      signer
    );

    return _wc;
  }, [signer, isCorrectChain]);

  return walletContract;
};

export default useWalletContract;
