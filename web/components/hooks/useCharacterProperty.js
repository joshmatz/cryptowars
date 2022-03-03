import React, { useQuery } from "react-query";
import usePropertyContract from "./usePropertyContract";

const useCharacterProperty = (characterId, propertyTypeIndex) => {
  const propertiesContract = usePropertyContract();

  return useQuery(
    ["characterProperty", characterId, propertyTypeIndex],
    async () => {
      let _characterProperty = {};
      let _propertyId;
      try {
        const hasProperty = await propertiesContract.characterPropertyTypes(
          characterId,
          propertyTypeIndex
        );

        if (hasProperty) {
          _propertyId = await propertiesContract.characterPropertyIds(
            characterId,
            propertyTypeIndex
          );
        } else {
          return _characterProperty;
        }

        _characterProperty = await propertiesContract.properties(_propertyId);
      } catch (e) {
        console.error(e);
      }

      return {
        id: _propertyId,
        level: _characterProperty.level,
        lastCollected: _characterProperty.lastCollected,
        investedFunds: _characterProperty.investedFunds,
      };
    },
    {
      enabled: !!propertiesContract && !!characterId,
    }
  );
};

export default useCharacterProperty;
