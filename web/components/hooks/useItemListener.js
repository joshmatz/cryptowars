import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useWeb3Context } from "../Web3ContextProvider";
import useItemContract from "./useItemContract";

const useItemListener = (address) => {
  const { connected } = useWeb3Context();
  const { contract } = useItemContract();
  const toast = useToast();
  useEffect(() => {
    let subscription;
    let timeout;
    let count = 0;
    let events;

    const receiveListener = (...args) => {
      count++;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        toast({
          position: "top",
          title: `${count} items received`,
          description: "Up only.",
          status: "success",
        });
        count = 0;
      }, 200);
    };

    // TODO: Burn listener

    if (contract && connected) {
      events = contract.filters.Transfer(null, address);
      subscription = contract.on(events, receiveListener);
    }

    return () => {
      if (subscription) {
        subscription.off(events, receiveListener);
      }
    };
  }, [contract, address, toast, connected]);
};

export default useItemListener;
