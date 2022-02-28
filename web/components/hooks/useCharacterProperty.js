import { useQuery } from "react-query";
import usePropertyContract from "./usePropertyContract";

const useCharacterProperty = (characterId, propertyTypeIndex) => {
  const propertiesContract = usePropertyContract();

  return useQuery(
    ["characterProperty", characterId, propertyTypeIndex],
    async () => {
      let _characterProperty = {};
      try {
        if (propertyTypeIndex === 0) {
          // TODO: index should be property id...
          _characterProperty = await propertiesContract.properties(
            propertyTypeIndex
          );
        }
      } catch (e) {
        // console.error(e);
      }

      // lastCollected is a timestamp in seconds
      // now - lastColleceted compared to property maxCollection
      // (now - lastCollected) / maxCollection
      // const collectionProgress =

      return {
        level: _characterProperty.level,
        lastCollected: _characterProperty.lastCollected,
        investedFunds: _characterProperty.investedFunds,
        // TODO: Return percentage of collection until fully collected.
        // collectionProgress: collectionProgress,
      };
    },
    {
      enabled: !!propertiesContract,
    }
  );
};

export default useCharacterProperty;
