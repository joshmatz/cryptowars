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

contract CryptoNYJobs is Ownable {
    using SafeMath for uint256;

    event JobComplete(
        address indexed sender,
        uint256 characterId,
        uint256 jobTierId,
        uint256 jobId,
        uint256 runs
    );

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
        uint256[] requiredItemIds;
        uint256[] requiredItemCounts;
        uint256[] rewardItemIds;
    }

    struct JobExperience {
        uint256 total;
        uint256 level;
    }

    uint256 public totalTiers = 0;
    mapping(uint256 => uint256) public totalJobsInTier;
    mapping(uint256 => mapping(uint256 => Job)) public jobTier;

    // characterJobTier[characterId] == tierUnlocked]
    mapping(uint256 => uint256) public characterJobTier;

    // characterId => tierId => jobId => jobExperience
    mapping(uint256 => mapping(uint256 => mapping(uint256 => JobExperience)))
        public jobExperience;

    address public contractOwner;
    address public characterContract;
    address public walletContract;
    address public itemsContract;

    constructor(
        address _charContract,
        address _walletContract,
        address _itemsContract
    ) {
        contractOwner = msg.sender;
        characterContract = _charContract;
        walletContract = _walletContract;
        itemsContract = _itemsContract;
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

    function completeJob(
        uint256 characterId,
        uint256 tierId,
        uint256 jobId,
        uint256 runs
    ) external isCharacterOwner(characterId) isCharacterInRegion(characterId) {
        require(runs > 0, "CryptoNyJobs.completeJob.runs");
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

        int256 skillPoints = 0;
        uint256 prevLevel = jobExperience[characterId][tierId][jobId].level;
        uint256 newExp = jobExperience[characterId][tierId][jobId].total +
            job.experience.mul(runs);
        uint256 newLevel = newExp.div(job.experiencePerTier);
        uint256 levelsGained = newLevel - prevLevel;

        jobExperience[characterId][tierId][jobId].total = newExp;

        if (
            levelsGained > 0 &&
            jobExperience[characterId][tierId][jobId].level < MAX_MASTERY
        ) {
            if (newLevel > MAX_MASTERY) {
                levelsGained =
                    MAX_MASTERY -
                    jobExperience[characterId][tierId][jobId].level;
            }

            jobExperience[characterId][tierId][jobId].level += levelsGained;

            skillPoints += int256(levelsGained);

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
            job.payout.mul(runs)
        );
        ICharacter(characterContract).updateCurrentAttributes(
            characterId,
            int256(job.experience.mul(runs)),
            0,
            -int256(job.energy.mul(runs)),
            0,
            skillPoints
        );

        if (job.rewardItemIds.length != 0) {
            uint256[4] memory rewardData = [0, characterId, newExp, runs];
            for (uint256 i = 0; i < job.rewardItemIds.length; i++) {
                rewardData[0] = job.rewardItemIds[i];
                IItems(itemsContract).rewardItemToCharacter(
                    msg.sender,
                    rewardData
                );
            }
        }

        // emit completion event
        emit JobComplete(msg.sender, characterId, tierId, jobId, runs);

        // TODO: Burn items
    }

    function _createJobTiers(uint256 total) external onlyOwner {
        require(totalTiers == 0, "CryptoNyJobs.createJobTiers.tiersExist");

        totalTiers = total;
        for (uint256 i = 0; i < total; i++) {
            totalJobsInTier[i] = 0;
        }
    }

    function _setJobType(
        uint256 tier,
        uint256 jobId,
        uint256 energy,
        uint256 payout,
        uint256 experience,
        uint256 experiencePerTier,
        uint256[] calldata requiredItemIds,
        uint256[] calldata requiredItemCounts,
        uint256[] calldata rewardItemIds
    ) external onlyOwner {
        require(tier < totalTiers, "CryptoNyJobs.createJobType.invalidTier");
        require(
            jobTier[tier][jobId].energy == 0,
            "CryptoNyJobs.createJobType.jobExists"
        );

        if (totalJobsInTier[tier] <= jobId) {
            totalJobsInTier[tier] = jobId + 1;
        }

        jobTier[tier][jobId] = Job(
            energy,
            payout,
            experience,
            experiencePerTier,
            requiredItemIds,
            requiredItemCounts,
            rewardItemIds
        );
    }

    function _setWalletContract(address _walletContract) public {
        require(
            _walletContract != address(0),
            "CryptoNyJobs.setWalletContract"
        );
        walletContract = _walletContract;
    }
}
