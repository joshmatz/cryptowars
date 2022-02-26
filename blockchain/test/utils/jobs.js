const { ethers, BigNumber } = require("ethers");

const jobTiers = [];

// 197 energy
const firstTierJobs = [
  {
    name: "",
    energy: 1,
    payout: ethers.utils.parseEther("350"),
    experience: 1,
    experiencePerTier: 10,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 3,
    payout: ethers.utils.parseEther("700"),
    experience: 3,
    experiencePerTier: 36,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 2,
    payout: ethers.utils.parseEther("944"),
    experience: 2,
    experiencePerTier: 26,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 2,
    payout: ethers.utils.parseEther("1260"),
    experience: 2,
    experiencePerTier: 26,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 9,
    payout: ethers.utils.parseEther("630"),
    experience: 11,
    experiencePerTier: 99,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 25,
    payout: ethers.utils.parseEther("1500"),
    experience: 1,
    experiencePerTier: 1,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
    // generally experience per tier requires 30% additional experience
  },
];

// 340 energy
const secondTierJobs = [
  {
    energy: 2,
    payout: ethers.utils.parseEther("2280"),
    experience: 2,
    experiencePerTier: 36,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 3,
    payout: ethers.utils.parseEther("2623"),
    experience: 4,
    experiencePerTier: 36,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 3,
    payout: ethers.utils.parseEther("1840"),
    experience: 3,
    experiencePerTier: 39,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 4,
    payout: ethers.utils.parseEther("2760"),
    experience: 5,
    experiencePerTier: 40,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 8,
    payout: ethers.utils.parseEther("4600"),
    experience: 15,
    experiencePerTier: 150,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 13,
    payout: ethers.utils.parseEther("5750"),
    experience: 23,
    experiencePerTier: 138,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
  {
    energy: 7,
    payout: "2280",
    experience: 9,
    experiencePerTier: 99,
    requiredItems: [],
    requiredItemCounts: [],
    itemRewards: [],
    itemRewardCounts: [],
  },
];

// let energy = BigNumber.from("0");
// secondTierJobs.forEach((job) => {
//   energy = energy.add(
//     job.energy.mul(job.experiencePerTier.div(job.experience))
//   );
// });

const firstTier = {
  level: ethers.utils.parseEther("0"),
  jobs: firstTierJobs,
};

const secondTier = {
  level: ethers.utils.parseEther("0"),
  jobs: secondTierJobs,
};

jobTiers.push(firstTier);
jobTiers.push(secondTier);

module.exports = {
  jobTiers,
};
