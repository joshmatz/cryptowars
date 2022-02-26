// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICryptoNyWallet {
    function balances(uint256 characterId) external view returns (uint256);

    function burnFromCharacter(uint256 _characterId, uint256 _amount) external;

    function mintToCharacter(uint256 _characterId, uint256 _amount) external;
}
