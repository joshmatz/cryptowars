import { useQuery } from "react-query";
import { useWeb3Context } from "../Web3ContextProvider";
import useWalletContract from "./useWalletContract";

const useTokens = (characterId) => {
  const {
    web3State: { address },
  } = useWeb3Context();
  const walletContract = useWalletContract();
  return useQuery(
    ["characterTokens", address, characterId],
    async () => {
      let _tokens;
      try {
        _tokens = await walletContract.balances(characterId);
      } catch (e) {
        console.error(e);
      }

      return _tokens;
    },
    {
      enabled: !!characterId && !!walletContract,
    }
  );
};

export default useTokens;
