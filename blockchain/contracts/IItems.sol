// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IItems {
    function rewardItemToCharacter(
        address _caller,
        uint256 _itemTypeId,
        uint256 _characterId,
        uint256 _seed,
        uint256 _attempts
    ) external;
}
