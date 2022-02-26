// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract CryptoChar is ERC721, ERC721Enumerable, Ownable {
    using SafeMath for uint256;

    enum CharacterClass {
        BRAIN,
        FIGHTER,
        CHARM
    }

    uint256 public constant ENERGY_REGEN_SECONDS = 300;
    uint256 public constant STAMINA_REGEN_SECONDS = 300;

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

    struct Region {
        uint256 requiredLevel;
        uint256 baseTravelTime;
    }

    // Map region index to region's management contract
    // Separate contract management allows for future logic expansion
    address[] public regionProperties;
    address[] public regionCurrency;
    address[] public regionJobs;
    address[] public regionItems;

    Region[] public regions;
    Character[] public characters;

    mapping(address => bool) public gameContracts;

    modifier onlyCharacterOwner(uint256 characterId) {
        require(
            ownerOf(characterId) == msg.sender,
            "Only the character owner can modify the character"
        );
        _;
    }

    modifier isGameContract() {
        require(gameContracts[msg.sender], "isGameContract");
        _;
    }

    constructor() ERC721("CryptoChar", "CC") {
        // Initialize an initial character
        _safeMint(msg.sender, 0);
        _createCharacter("Genesis", CharacterClass.BRAIN);
    }

    function create(string memory name, CharacterClass characterClass)
        external
    {
        _safeMint(msg.sender, totalSupply());
        _createCharacter(name, characterClass);
    }

    // TODO: This should be a function of the region, not of the character.
    // This contract should let the regions set the region of the character,
    // but each region gets to stipulate _how_ the traveling is done.
    function travel(uint256 characterId, uint256 region)
        external
        onlyCharacterOwner(characterId)
        returns (uint256)
    {
        require(characters[characterId].level >= 10, "CryptoChar.travel.level");

        // address regionContract = regionContracts[region];

        require(
            // solhint-disable-next-line
            block.timestamp > characters[characterId].lastTravelTime + 9 days,
            "CryptoChar.travel.time"
        );

        characters[characterId].currentRegion = region;

        return characters[characterId].currentRegion;
    }

    function isCharacterInRegion(uint256 characterId, uint256 region)
        external
        view
        returns (bool)
    {
        return characters[characterId].currentRegion == region;
    }

    function _addRegion(
        uint256 requiredLevel,
        uint256 baseTravelTime,
        address regionPropertyContract
    ) external onlyOwner {
        regions.push(Region(requiredLevel, baseTravelTime));
        regionProperties.push(regionPropertyContract);
    }

    function addGameContract(address _contract) public onlyOwner {
        gameContracts[_contract] = true;
    }

    function useSkillPoints(
        uint256 characterId,
        uint256 energy,
        uint256 stamina,
        uint256 attack,
        uint256 defense
    ) external onlyCharacterOwner(characterId) returns (uint256) {
        require(energy >= 0, "CryptoChar.useSkillPoints.energy");
        require(stamina >= 0, "CryptoChar.useSkillPoints.stamina");
        require(attack >= 0, "CryptoChar.useSkillPoints.attack");
        require(defense >= 0, "CryptoChar.useSkillPoints.defense");
        require(
            characters[characterId].skillPoints > 0,
            "CryptoChar.useSkillPoints.noSkillPoints"
        );
        require(
            characters[characterId].skillPoints >=
                energy + stamina + attack + defense,
            "CryptoChar.useSkillPoints.inefficientSkillPoints"
        );

        characters[characterId].skillPoints -= energy;
        characters[characterId].skillPoints -= stamina;
        characters[characterId].skillPoints -= attack;
        characters[characterId].skillPoints -= defense;

        characters[characterId].energy.current += energy;
        characters[characterId].energy.characterMax += energy;
        characters[characterId].energy.equippedMax += energy;

        characters[characterId].stamina.current += stamina;
        characters[characterId].stamina.characterMax += stamina;
        characters[characterId].stamina.equippedMax += stamina;

        characters[characterId].attack.current += attack;
        characters[characterId].attack.characterMax += attack;
        characters[characterId].attack.equippedMax += attack;

        characters[characterId].defense.current += defense;
        characters[characterId].defense.characterMax += defense;
        characters[characterId].defense.equippedMax += defense;

        return characters[characterId].skillPoints;
    }

    function regenerateStamina(uint256 characterId) public {
        uint256 staminaRegen = ((block.timestamp -
            characters[characterId].stamina.lastCollected) / (60 * 5));

        if (staminaRegen != 0) {
            characters[characterId].stamina.current += staminaRegen;

            if (
                characters[characterId].stamina.current >
                characters[characterId].stamina.equippedMax
            ) {
                characters[characterId].stamina.current = characters[
                    characterId
                ].stamina.equippedMax;
                characters[characterId].stamina.lastCollected = block.timestamp;
            } else {
                // Only update to minimum timestamp
                characters[characterId].stamina.lastCollected +=
                    staminaRegen *
                    (60 * 5);
            }
        }
    }

    function regenerateEnergy(uint256 characterId) public {
        uint256 energyRegen = ((block.timestamp -
            characters[characterId].energy.lastCollected) /
            ENERGY_REGEN_SECONDS);

        if (energyRegen != 0) {
            characters[characterId].energy.current += energyRegen;

            // Limit regen to maximum possible
            if (
                characters[characterId].energy.current >
                characters[characterId].energy.equippedMax
            ) {
                characters[characterId].energy.current = characters[characterId]
                    .energy
                    .equippedMax;
                characters[characterId].energy.lastCollected = block.timestamp;
            } else {
                // Only update to minimum timestamp
                characters[characterId].energy.lastCollected +=
                    energyRegen *
                    ENERGY_REGEN_SECONDS;
            }
        }
    }

    function updateCurrentAttributes(
        uint256 characterId,
        int256 experience,
        int256 stamina,
        int256 energy,
        int256 health,
        int256 skillPoints
    ) external isGameContract {
        if (stamina != 0) {
            if (stamina > 0) {
                characters[characterId].stamina.current += uint256(stamina);
            } else {
                require(
                    characters[characterId].stamina.current >=
                        uint256(-stamina),
                    "CryptoChar.updateCurrentAttributes.stamina"
                );
                characters[characterId].stamina.current -= uint256(-stamina);
            }
        }

        if (energy != 0) {
            if (energy > 0) {
                characters[characterId].energy.current += uint256(energy);
            } else {
                regenerateEnergy(characterId);

                require(
                    characters[characterId].energy.current >= uint256(-energy),
                    "CryptoChar.updateCurrentAttributes.energy"
                );

                characters[characterId].energy.current -= uint256(-energy);
            }
        }

        if (health != 0) {
            if (health > 0) {
                characters[characterId].health.current += uint256(health);
            } else {
                if (
                    characters[characterId].health.current >= uint256(-health)
                ) {
                    characters[characterId].health.current -= uint256(-health);
                } else {
                    characters[characterId].health.current = 0;
                }
            }
        }

        if (skillPoints != 0) {
            if (skillPoints > 0) {
                characters[characterId].skillPoints += uint256(skillPoints);
            } else {
                require(
                    characters[characterId].skillPoints >=
                        uint256(-skillPoints),
                    "CryptoChar.updateCurrentAttributes.skillPoints"
                );
                characters[characterId].skillPoints -= uint256(-skillPoints);
            }
        }

        if (experience != 0) {
            if (experience > 0) {
                characters[characterId].experience += uint256(experience);
            } else {
                characters[characterId].experience -= uint256(-experience);
            }

            uint256 previousLevel = characters[characterId].level;
            characters[characterId].level = _sqrt(
                (characters[characterId].experience * 4) / 25
            );

            if (characters[characterId].level > previousLevel) {
                // 1 SP per level
                characters[characterId].skillPoints +=
                    characters[characterId].level -
                    previousLevel;

                // Reset stamina
                characters[characterId].stamina.current = characters[
                    characterId
                ].stamina.equippedMax;
            }
        }
    }

    function _createCharacter(string memory name, CharacterClass characterClass)
        private
    {
        characters.push(
            Character(
                name,
                characterClass,
                0,
                0,
                1,
                // health
                Attribute(100, 100, 100, block.timestamp),
                // energy
                Attribute(10, 10, 10, block.timestamp),
                // stamina
                Attribute(3, 3, 3, block.timestamp),
                // attack
                Attribute(5, 5, 5, block.timestamp),
                // defense
                Attribute(5, 5, 5, block.timestamp),
                0,
                block.timestamp
            )
        );
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string[2] memory parts;
        parts[
            0
        ] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        parts[1] = "</text></svg>";

        string memory output = string(abi.encodePacked(parts[0], parts[1]));

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        // solhint-disable-next-line
                        '{"name": "Char #',
                        characters[tokenId].name,
                        "#",
                        Strings.toString(tokenId),
                        // solhint-disable-next-line
                        '", "description": "CryptoWars, yadadaadada.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(output)),
                        // solhint-disable-next-line
                        '"}'
                    )
                )
            )
        );
        output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
