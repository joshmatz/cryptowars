// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICharacter {
    enum CharacterClass {
        BRAIN,
        FIGHTER,
        CHARM
    }

    struct Attribute {
        uint256 current;
        uint256 characterMax;
        uint256 equippedMax;
        uint256 lastCollected;
    }

    struct Character {
        string name;
        CharacterClass charClass;
        uint256 currentRegion;
        uint256 experience;
        uint256 level;
        Attribute health;
        Attribute energy;
        Attribute stamina;
        // fighter > brain > charm > fighter
        Attribute attack;
        Attribute defense;
        uint256 skillPoints;
        uint256 lastTravelTime;
    }

    function characters(uint256 characterId)
        external
        returns (Character memory);

    function ownerOf(uint256 _tokenId) external view returns (address);

    function useSkillPoints(
        uint256 characterId,
        uint256 energy,
        uint256 stamina,
        uint256 attack,
        uint256 defense
    ) external;

    function updateCurrentAttributes(
        uint256 characterId,
        int256 experience,
        int256 stamina,
        int256 energy,
        int256 health,
        int256 skillPoints
    ) external;

    function isCharacterInRegion(uint256 characterId, uint256 regionId)
        external
        view
        returns (bool);
}
