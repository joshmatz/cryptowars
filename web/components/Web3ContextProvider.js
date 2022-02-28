import { ethers } from "ethers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import detectEthereumProvider from "@metamask/detect-provider";

const Web3Context = createContext();

const initialState = {
  account: null,
  address: "",
  assets: [],
  connected: false,
  provider: null,
};

const DEPLOYED_CHAIN = 1337;

const reducer = (state, action) => {
  switch (action.type) {
    case "walletAvailable":
      return {
        ...state,
        connected: true,
        ...action.payload,
      };
    case "chainChanged": {
      return {
        ...state,
        ...action.payload,
      };
    }
    case "addressUpdate": {
      return {
        ...state,
        address: action.payload.address,
      };
    }
    case "invalidChain": {
      return {
        ...state,
        isCorrectChain: false,
      };
    }
    case "reset":
      // state.web3State.provider?.close();
      return {
        ...state,
        ...initialState,
      };
    default:
      return state;
  }
};

const Web3ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    isInitializing: true,
  });

  // const connect = useCallback(async () => {
  //   const provider = new ethers.providers.Web3Provider(instance);
  //   const signer = provider.getSigner();
  //   const address = await signer.getAddress();
  //   const network = await provider.getNetwork();

  //   dispatch({
  //     type: "connect",
  //     payload: {
  //       provider,
  //       address,
  //       network,
  //       connected: true,
  //       web3ModalInstance: instance,
  //     },
  //   });
  // }, []);

  const connect = async () => {
    if (!state.connected) {
      const accounts = await state.wallet.request({
        method: "eth_requestAccounts",
      });
    } else if (!state.isCorrectChain) {
      const res = await state.wallet.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${DEPLOYED_CHAIN.toString(16)}` }],
      });
      console.log({ res });
    }
  };

  useEffect(async () => {
    const wallet = await detectEthereumProvider();
    if (wallet) {
      let connected = true;

      const provider = new ethers.providers.Web3Provider(wallet);

      const signer = provider.getSigner();

      let address = "";
      try {
        address = await signer.getAddress();
      } catch (e) {
        connected = false;
      }

      const network = await provider.getNetwork();
      console.log({ network, DEPLOYED_CHAIN });
      let isCorrectChain = true;
      if (network.chainId !== DEPLOYED_CHAIN) {
        console.log("isCorrectChain NOT");
        isCorrectChain = false;
      }

      dispatch({
        type: "walletAvailable",
        payload: {
          provider,
          signer,
          address,
          network,
          connected,
          wallet,
          isCorrectChain,
          isInitializing: false,
        },
      });
    }
  }, []);

  useEffect(() => {
    state.wallet?.on("disconnect", () => dispatch({ type: "reset" }));

    state.wallet?.on("accountsChanged", async (accounts) => {
      if (!accounts[0]) {
        dispatch({
          type: "reset",
        });
      }

      const signer = state.provider.getSigner();
      const address = await signer.getAddress();
      dispatch({
        type: "addressUpdate",
        payload: { signer, address },
      });
    });

    state.wallet?.on("chainChanged", async () => {
      let isCorrectChain = true;

      const provider = new ethers.providers.Web3Provider(state.wallet);
      const network = await provider.getNetwork();
      const signer = provider.getSigner();
      if (network.chainId !== DEPLOYED_CHAIN) {
        console.log("chainwrong");
        dispatch({ type: "invalidChain" });
        return;
      }
      console.log("chainChanged");

      dispatch({
        type: "chainChanged",
        payload: { provider, network, signer, isCorrectChain },
      });
    });

    return () => {
      state.provider?.removeAllListeners();
    };
  }, [state.provider]);

  return (
    <Web3Context.Provider value={{ web3State: state, connect }}>
      {children}
    </Web3Context.Provider>
  );
};

const useWeb3Context = () => {
  return useContext(Web3Context);
};

export { useWeb3Context };

export default Web3ContextProvider;
