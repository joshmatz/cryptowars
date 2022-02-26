// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ICharacter.sol";
import "./ICryptoNYWallet.sol";

contract CryptoNYJobs is Ownable {
    using SafeMath for uint256;

    uint256 public constant REGION = 0;
    uint256 public constant MAX_MASTERY = 3;

    enum PropertyClass {
        CASH
    }

    struct Job {
        uint256 energy;
        uint256 payout;
        uint256 experience;
        uint256 experiencePerTier;

        // TODO: Required Items
        // uint256[] requiredItems;
        // uint256[] requiredItemCounts;
        // uint256[] itemRewards;
        // uint256[] itemRewardCounts;
    }

    struct JobExperience {
        uint256 total;
        uint256 level;
    }

    uint256 public totalTiers;
    mapping(uint256 => uint256) public totalJobsInTier;
    mapping(uint256 => Job[]) public jobTier;

    // characterJobTier[characterId] == tierUnlocked]
    mapping(uint256 => uint256) public characterJobTier;

    // characterId => tierId => jobId => jobExperience
    mapping(uint256 => mapping(uint256 => mapping(uint256 => JobExperience)))
        public jobExperience;

    address public contractOwner;
    address public characterContract;
    address public walletContract;

    constructor(address _charContract, address _walletContract) {
        contractOwner = msg.sender;
        characterContract = _charContract;
        walletContract = _walletContract;
    }

    modifier isCharacterOwner(uint256 characterId) {
        require(
            ICharacter(characterContract).ownerOf(characterId) == msg.sender,
            "CryptoNyJobs.characterOwner"
        );
        _;
    }

    modifier isCharacterInRegion(uint256 characterId) {
        require(
            ICharacter(characterContract).isCharacterInRegion(
                characterId,
                REGION
            ) == true,
            "CryptoNyJobs.characterInRegion"
        );
        _;
    }

    // TODO: Complete job multiple times in one transaction.
    function completeJob(
        uint256 characterId,
        uint256 tierId,
        uint256 jobId
    ) external isCharacterOwner(characterId) isCharacterInRegion(characterId) {
        require(tierId < totalTiers, "CryptoNyJobs.completeJob.invalidJobTier");
        require(
            jobId < totalJobsInTier[tierId],
            "CryptoNyJobs.completeJob.invalidJobId"
        );
        require(
            tierId <= characterJobTier[characterId],
            "CryptoNyJobs.completeJob.tierLocked"
        );

        Job storage job = jobTier[tierId][jobId];

        jobExperience[characterId][tierId][jobId] = JobExperience(
            jobExperience[characterId][tierId][jobId].total + job.experience,
            jobExperience[characterId][tierId][jobId].level
        );

        int256 skillPoints = 0;

        if (
            jobExperience[characterId][tierId][jobId].total >=
            job.experiencePerTier &&
            jobExperience[characterId][tierId][jobId].level < MAX_MASTERY
        ) {
            jobExperience[characterId][tierId][jobId].level++;
            jobExperience[characterId][tierId][jobId].total = 0;
            skillPoints++;

            if (
                characterJobTier[characterId] < totalTiers &&
                characterJobTier[characterId] <= tierId
            ) {
                // loop through jobs in tier and if all at least level 1, unlock next tier
                bool allCompleted = true;
                for (uint256 i = 0; i < totalJobsInTier[tierId]; i++) {
                    if (jobExperience[characterId][tierId][i].level == 0) {
                        allCompleted = false;
                        break;
                    }
                }
                if (allCompleted == true) {
                    characterJobTier[characterId]++;
                }
            }
        }

        ICryptoNyWallet(walletContract).mintToCharacter(
            characterId,
            job.payout
        );
        ICharacter(characterContract).updateCurrentAttributes(
            characterId,
            int256(job.experience),
            0,
            -int256(job.energy),
            0,
            skillPoints
        );
        // TODO: Burn items
        // TODO: Mint items
    }

    function _createJobTier() external onlyOwner {
        uint256 tier = totalTiers;
        totalTiers++;
        totalJobsInTier[tier] = 0;
    }

    function _createJobType(
        uint256 tier,
        uint256 energy,
        uint256 payout,
        uint256 experience,
        uint256 experiencePerTier
    ) external onlyOwner {
        require(tier < totalTiers, "CryptoNyJobs.createJobType.invalidTier");

        totalJobsInTier[tier]++;
        jobTier[tier].push(Job(energy, payout, experience, experiencePerTier));
    }

    function _setWalletContract(address _walletContract) public {
        require(
            _walletContract != address(0),
            "CryptoNyJobs.setWalletContract"
        );
        walletContract = _walletContract;
    }
}
