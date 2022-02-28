import { useQuery } from "react-query";
import usePropertyContract from "./usePropertyContract";

const usePropertyTypes = (propertyTypeIndex) => {
  const propertyContract = usePropertyContract();

  return useQuery(
    ["propertyTypes", propertyTypeIndex],
    async () => {
      let _propertyType;
      try {
        _propertyType = await propertyContract.propertyTypes(propertyTypeIndex);
      } catch (e) {
        console.error(e);
      }

      return {
        cost: _propertyType.cost,
        costPerLevel: _propertyType.costPerLevel,
        incomePerLevel: _propertyType.incomePerLevel,
        maxLevel: _propertyType.maxLevel,
        maxCollection: _propertyType.maxCollection,
      };
    },
    {
      enabled: !!propertyContract,
    }
  );
};

export default usePropertyTypes;
