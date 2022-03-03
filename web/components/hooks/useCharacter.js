import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useWeb3Context } from "../Web3ContextProvider";
import useCharacterContract from "./useCharacterContract";
const fiveMinutes = 5 * 60;

const getCurrentStat = (
  current,
  max,
  lastCollected,
  timeNeeded = fiveMinutes
) => {
  const now = Math.floor(Date.now() / 1000);

  const lastCollectedTime = lastCollected.toNumber();
  const timeDifference = now - lastCollectedTime;
  if (timeDifference <= 0) {
    return current;
  }

  const regen = Math.floor(timeDifference / fiveMinutes);
  const newStat = current.add(regen);

  if (newStat.gt(max)) {
    return max;
  }

  return newStat;
};

const adjustCurrentStats = (c) => {
  if (!c) {
    return;
  }

  return {
    ...c,
    attack: {
      ...c.attack,
      adjustedCurrent: getCurrentStat(
        c.attack.current,
        c.attack.characterMax,
        c.attack.lastCollected
      ),
    },
    health: {
      ...c.health,
      adjustedCurrent: getCurrentStat(
        c.health.current,
        c.health.characterMax,
        c.health.lastCollected
      ),
    },
    defense: {
      ...c.defense,
      adjustedCurrent: getCurrentStat(
        c.defense.current,
        c.defense.characterMax,
        c.defense.lastCollected
      ),
    },
    energy: {
      ...c.energy,
      adjustedCurrent: getCurrentStat(
        c.energy.current,
        c.energy.characterMax,
        c.energy.lastCollected
      ),
    },
    stamina: {
      ...c.stamina,
      adjustedCurrent: getCurrentStat(
        c.stamina.current,
        c.stamina.characterMax,
        c.stamina.lastCollected
      ),
    },
  };
};

const useCharacter = (characterId) => {
  const {
    web3State: { address },
  } = useWeb3Context();
  const characterContract = useCharacterContract();

  const res = useQuery(
    ["characters", address, characterId],
    async () => {
      let _character;
      try {
        _character = await characterContract.characters(characterId);
      } catch (e) {
        console.error(e);
      }

      return {
        id: characterId,
        name: _character.name,
        level: _character.level,
        experience: _character.experience,
        currentRegion: _character.currentRegion,
        lastTravelTime: _character.lastTravelTime,
        skillPoints: _character.skillPoints,

        attack: {
          current: _character.attack.current,
          characterMax: _character.attack.characterMax,
          equippedMax: _character.attack.equippedMax,
          lastCollected: _character.attack.lastCollected,
        },
        health: {
          adjustedCurrent: _character.health.current,
          current: _character.health.current,
          characterMax: _character.health.characterMax,
          equippedMax: _character.health.equippedMax,
          lastCollected: _character.health.lastCollected,
        },
        defense: {
          current: _character.defense.current,
          characterMax: _character.defense.characterMax,
          equippedMax: _character.defense.equippedMax,
          lastCollected: _character.defense.lastCollected,
        },
        energy: {
          adjustedCurrent: _character.energy.current,
          current: _character.energy.current,
          characterMax: _character.energy.characterMax,
          equippedMax: _character.energy.equippedMax,
          lastCollected: _character.energy.lastCollected,
        },
        stamina: {
          adjustedCurrent: _character.stamina.current,
          current: _character.stamina.current,
          characterMax: _character.stamina.characterMax,
          equippedMax: _character.stamina.equippedMax,
          lastCollected: _character.stamina.lastCollected,
        },
      };
    },
    {
      enabled: !!characterId && !!characterContract && !!address,
    }
  );

  const [character, setCharacter] = useState(res.data);

  useEffect(() => {
    setCharacter(adjustCurrentStats(res.data));
    const interval = setInterval(() => {
      setCharacter(adjustCurrentStats);
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [res.data]);

  return { ...res, data: character };
};

export default useCharacter;
