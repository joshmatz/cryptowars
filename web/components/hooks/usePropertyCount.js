import { useQuery } from "react-query";
import usePropertyContract from "./usePropertyContract";

const usePropertyCount = (address) => {
  const propertiesContract = usePropertyContract();
  return useQuery(
    ["properties", address],
    async () => {
      let properties;
      try {
        properties = await propertiesContract.balanceOf(address);
      } catch (e) {
        console.error(e);
      }
      return properties;
    },
    {
      enabled: !!propertiesContract,
    }
  );
};

export default usePropertyCount;
