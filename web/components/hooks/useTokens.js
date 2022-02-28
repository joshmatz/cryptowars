import { useQuery } from "react-query";
import useWalletContract from "./useWalletContract";

const useTokens = (address, characterId) => {
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
