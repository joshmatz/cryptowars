// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ICharacter.sol";
import "./ICryptoNYWallet.sol";
import "./IItems.sol";
import "./Character.sol";

struct FightingCharacter {
    uint256 level;
    uint256 attackCharacter;
    uint256 attackEquipment;
    uint256 defenseCharacter;
    uint256 defenseEquipment;
    uint256 stamina;
    uint256 health;
}

enum FIGHTER {
    level,
    characterAttack,
    equipmentAttack,
    characterDefense,
    equipmentDefense,
    stamina,
    health
}

contract CryptoNYFight is Ownable {
    using SafeMath for uint256;

    uint256 public constant REGION = 0;

    address public contractOwner;
    address public characterContract;
    address public walletContract;
    // address public itemsContract;

    mapping(uint256 => uint256) public characterAttacksTotal;
    mapping(uint256 => uint256) public characterAttacksWon;
    mapping(uint256 => uint256) public characterAttacksLost;
    mapping(uint256 => uint256) public characterKOsTotal;
    mapping(uint256 => uint256) public characterDefendsTotal;
    mapping(uint256 => uint256) public characterDefendsWon;
    mapping(uint256 => uint256) public characterDefendsLost;

    // address _itemsContract
    constructor(address _charContract, address _walletContract) {
        contractOwner = msg.sender;
        characterContract = _charContract;
        walletContract = _walletContract;
        // itemsContract = _itemsContract;
    }

    modifier isCharacterOwner(uint256 characterId) {
        require(
            ICharacter(characterContract).ownerOf(characterId) == msg.sender,
            "Fight.characterOwner"
        );
        _;
    }

    modifier isCharacterInRegion(uint256 characterId) {
        require(
            ICharacter(characterContract).isCharacterInRegion(
                characterId,
                REGION
            ) == true,
            "Fight.characterInRegion"
        );
        _;
    }

    function attackCharacter(
        uint256 attackingCharacterId,
        uint256 defendingCharacterId
    ) public isCharacterOwner(attackingCharacterId) {
        require(
            attackingCharacterId != defendingCharacterId,
            "Fight.sameCharacter"
        );

        uint256[7] memory attacker = CryptoChar(characterContract)
            .getCharacterStats(attackingCharacterId);

        uint256[7] memory defender = CryptoChar(characterContract)
            .getCharacterStats(defendingCharacterId);

        require(attacker[uint256(FIGHTER.stamina)] > 0, "Fight.noStamina");
        require(
            attacker[uint256(FIGHTER.level)] != 0,
            "Fight.attackingCharacterExists"
        );
        require(
            defender[uint256(FIGHTER.level)] != 0,
            "Fight.defendingCharacterExists"
        );
        // It is not necessary to require health checks at this point.
        // updateCharacterAttributes will regenerate the character's health.
        // If the health at that point is 0, the character is dead and
        // this entire function will reject.
        require(
            attacker[uint256(FIGHTER.level)] <=
                (11 * defender[uint256(FIGHTER.level)]) / 10,
            "Fight.notAFairFight"
        );

        uint256 totalAttacks = characterAttacksTotal[attackingCharacterId];

        uint256 roll = uint256(
            keccak256(abi.encodePacked(attackingCharacterId + totalAttacks))
        ) % 100;

        uint256 attackerScore = (1000 *
            (attacker[uint256(FIGHTER.level)] *
                attacker[uint256(FIGHTER.characterAttack)] +
                attacker[uint256(FIGHTER.level)] *
                attacker[uint256(FIGHTER.equipmentAttack)])) / (950 + roll);
        uint256 defenderScore = (1000 *
            (defender[uint256(FIGHTER.level)] *
                defender[uint256(FIGHTER.characterDefense)] +
                defender[uint256(FIGHTER.level)] *
                defender[uint256(FIGHTER.equipmentDefense)])) / (1050 - roll);

        if (attackerScore > defenderScore) {
            characterAttacksWon[attackingCharacterId]++;
            characterDefendsLost[defendingCharacterId]++;
        } else {
            characterAttacksLost[attackingCharacterId]++;
            characterDefendsWon[defendingCharacterId]++;
        }
        console.log(
            "Roll: %s, Attacker Score: %s, Defender Score: %s",
            roll,
            attackerScore,
            defenderScore
        );
        CryptoChar(characterContract).updateCurrentAttributes(
            attackingCharacterId,
            0,
            1,
            0,
            -int256(
                (
                    (attacker[uint256(FIGHTER.health)] *
                        ((1000 * defenderScore) / attackerScore))
                ) / 10000
            ),
            0
        );

        CryptoChar(characterContract).updateCurrentAttributes(
            defendingCharacterId,
            0,
            0,
            0,
            -int256(
                (
                    (defender[uint256(FIGHTER.health)] *
                        ((1000 * attackerScore) / defenderScore))
                ) / 10000
            ),
            0
        );

        characterAttacksTotal[attackingCharacterId]++;
        characterDefendsTotal[defendingCharacterId]++;
    }
}
