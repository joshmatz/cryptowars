import { useQuery } from "react-query";
import { useWeb3Context } from "../Web3ContextProvider";
import useCharacterContract from "./useCharacterContract";
const fiveMinutes = 5 * 60;

const calculateRegeneratedStat = (stat, max, timeNeeded = fiveMinutes) => {
  const now = Math.floor(Date.now() / 1000);
  const lastCollected = stat;
  const lastCollectedTime = lastCollected.toNumber();
  const timeDifference = now - lastCollectedTime;
  const regen = Math.floor(timeDifference / fiveMinutes);

  console.log({ regen });
  return regen;
};

const getCurrentStat = (
  current,
  max,
  lastCollected,
  timeNeeded = fiveMinutes
) => {
  const now = Math.floor(Date.now() / 1000);
  const lastCollectedTime = lastCollected.toNumber();
  const timeDifference = now - lastCollectedTime;
  const regen = Math.floor(timeDifference / fiveMinutes);
  const currentStat = current.add(regen);
  if (currentStat.gt(max)) {
    return max;
  }

  return currentStat;
};

const useCharacter = (characterId) => {
  const {
    web3State: { address },
  } = useWeb3Context();
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
          current: getCurrentStat(
            _character.energy[0],
            _character.energy[2],
            _character.energy[3]
          ),
          characterMax: _character.energy[1],
          equippedMax: _character.energy[2],
          lastCollected: _character.energy[3],
        },
        stamina: {
          current: getCurrentStat(
            _character.stamina[0],
            _character.stamina[2],
            _character.stamina[3]
          ),
          characterMax: _character.stamina[1],
          equippedMax: _character.stamina[2],
          lastCollected: _character.stamina[3],
        },
      };
    },
    {
      enabled: !!characterId && !!characterContract && !!address,
    }
  );
};

export default useCharacter;
