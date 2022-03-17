import { useToast } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useMutation } from "react-query";

const useContractMutation = (
  transactionFunction,
  { notificationSuccess, notificationProgress },
  opts
) => {
  const [uuid] = useState(() => Math.random().toString(36).substring(7));
  const toast = useToast();
  const ref = useRef();

  return useMutation(async () => {
    let tx;
    try {
      tx = await transactionFunction();
    } catch (e) {
      if (e.code === 4001) {
        return;
      }
      toast({
        title: "Malfunction in the system...",
        description: e.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    ref.current = toast({
      id: uuid,
      title: notificationProgress.title,
      description: notificationProgress.description,
      status: "info",
      duration: null,
      isClosable: true,
    });
    try {
      await tx.wait(1);
    } catch (e) {
      console.log(e);
      toast.close(ref.current);
      toast({
        title: "Malfunction in the system...",
        description: "See dev tools for more information.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    toast.close(ref.current);
    toast({
      title: notificationSuccess.title,
      description: notificationSuccess.description,
      status: "success",
      duration: 9000,
      isClosable: true,
    });

    return;
  }, opts);
};

export default useContractMutation;
