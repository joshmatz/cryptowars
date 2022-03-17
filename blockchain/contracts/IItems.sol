// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IItems {
    function rewardItemToCharacter(
        address _caller,
        uint256[4] calldata rewardData
    ) external;
}
