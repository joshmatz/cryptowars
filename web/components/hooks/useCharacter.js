import { useQuery } from "react-query";
import useCharacterContract from "./useCharacterContract";

const useCharacter = (address, characterId) => {
  const characterContract = useCharacterContract();

  return useQuery(
    ["characters", address, characterId],
    async () => {
      let _character;
      try {
        _character = await characterContract.characters(characterId);
      } catch (e) {
        console.error(e);
      }

      return {
        name: _character.name,
        level: _character.level,
        experience: _character.experience,
        currentRegion: _character.currentRegion,
        lastTravelTime: _character.lastTravelTime,
        skillPoints: _character.skillPoints,

        attack: {
          current: _character.attack[0],
          characterMax: _character.attack[1],
          equippedMax: _character.attack[2],
          lastCollected: _character.attack[3],
        },
        health: {
          current: _character.health[0],
          characterMax: _character.health[1],
          equippedMax: _character.health[2],
          lastCollected: _character.health[3],
        },
        defense: {
          current: _character.defense[0],
          characterMax: _character.defense[1],
          equippedMax: _character.defense[2],
          lastCollected: _character.defense[3],
        },
        energy: {
          current: _character.energy[0],
          characterMax: _character.energy[1],
          equippedMax: _character.energy[2],
          lastCollected: _character.energy[3],
        },
        stamina: {
          current: _character.stamina[0],
          characterMax: _character.stamina[1],
          equippedMax: _character.stamina[2],
          lastCollected: _character.stamina[3],
        },
      };
    },
    {
      enabled: !!characterId && !!characterContract,
    }
  );
};

export default useCharacter;
