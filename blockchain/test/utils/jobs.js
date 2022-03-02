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
  level: ethers.utils.parseEther("5"),
  jobs: secondTierJobs,
};

jobTiers.push(firstTier);
jobTiers.push(secondTier);

jobTiers.push({
  level: ethers.utils.parseEther("9"),
  jobs: [
    {
      energy: 5,
      payout: ethers.utils.parseEther("7360"),
      experience: 5,
      experiencePerTier: 75,
    },
    {
      energy: 5,
      payout: ethers.utils.parseEther("8096"),
      experience: 5,
      experiencePerTier: 50,
    },
    {
      energy: 5,
      payout: ethers.utils.parseEther("8740"),
      experience: 5,
      experiencePerTier: 25,
    },
    {
      energy: 6,
      payout: ethers.utils.parseEther("32200"),
      experience: 8,
      experiencePerTier: 96,
    },
    {
      energy: 5,
      payout: ethers.utils.parseEther("10120"),
      experience: 6,
      experiencePerTier: 60,
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("20700"),
      experience: 13,
      experiencePerTier: 195,
    },
    {
      energy: 7,
      payout: ethers.utils.parseEther("22310"),
      experience: 9,
      experiencePerTier: 180,
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("13"),
  jobs: [
    {
      energy: 22,
      payout: ethers.utils.parseEther("115000"),
      experience: 35,
      experiencePerTier: 350,
    },
    {
      energy: 16,
      payout: ethers.utils.parseEther("55200"),
      experience: 25,
      experiencePerTier: 125,
    },
    {
      energy: 26,
      payout: ethers.utils.parseEther("517500"),
      experience: 41,
      experiencePerTier: 410,
    },
    {
      energy: 17,
      payout: ethers.utils.parseEther("690000"),
      experience: 38,
      experiencePerTier: 190,
    },

    {
      energy: 16,
      payout: ethers.utils.parseEther("299000"),
      experience: 25,
      experiencePerTier: 250,
    },
    {
      energy: 26,
      payout: ethers.utils.parseEther("2300000"),
      experience: 52,
      experiencePerTier: 520,
    },
    {
      energy: 16,
      payout: ethers.utils.parseEther("299000"),
      experience: 25,
      experiencePerTier: 250,
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 14000,
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 14000,
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 14000,
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 14000,
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("18"),
  jobs: [
    {
      energy: 11,
      payout: ethers.utils.parseEther("124200"),
      experience: 21,
      experiencePerTier: 210,
    },
    {
      energy: 13,
      payout: ethers.utils.parseEther("163300"),
      experience: 23,
      experiencePerTier: 276,
    },
    {
      energy: 22,
      payout: ethers.utils.parseEther("276000"),
      experience: 35,
      experiencePerTier: 385,
    },
    {
      energy: 22,
      payout: ethers.utils.parseEther("1150000"),
      experience: 41,
      experiencePerTier: 41,
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("2530000"),
      experience: 58,
      experiencePerTier: 290,
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("2875000"),
      experience: 58,
      experiencePerTier: 290,
    },
    {
      energy: 35,
      payout: ethers.utils.parseEther("3450000"),
      experience: 67,
      experiencePerTier: 670,
    },
    {
      energy: 24,
      payout: ethers.utils.parseEther("230000"),
      experience: 37,
      experiencePerTier: 370,
    },
    {
      energy: 23,
      payout: ethers.utils.parseEther("437000"),
      experience: 38,
      experiencePerTier: 456,
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("25"),
  jobs: [
    {
      energy: 28,
      payout: ethers.utils.parseEther("1035000"),
      experience: 42,
      experiencePerTier: 420,
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("1150000"),
      experience: 46,
      experiencePerTier: 460,
    },
    {
      energy: 22,
      payout: ethers.utils.parseEther("920000"),
      experience: 35,
      experiencePerTier: 35 * 12,
    },
    {
      energy: 26,
      payout: ethers.utils.parseEther("966000"),
      experience: 42,
      experiencePerTier: 42 * 11,
    },
    {
      energy: 53,
      payout: ethers.utils.parseEther("1495000"),
      experience: 69,
      experiencePerTier: 69 * 10,
    },
    {
      energy: 26,
      payout: ethers.utils.parseEther("1092500"),
      experience: 45,
      experiencePerTier: 45 * 15,
    },
    {
      energy: 17,
      payout: ethers.utils.parseEther("966000"),
      experience: 31,
      experiencePerTier: 31 * 10,
    },
    {
      energy: 24,
      payout: ethers.utils.parseEther("1725000"),
      experience: 44,
      experiencePerTier: 44 * 9,
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("35"),
  jobs: [
    {
      energy: 45,
      payout: ethers.utils.parseEther("3335000"),
      experience: 74,
      experiencePerTier: 74 * 5,
    },
    {
      energy: 32,
      payout: ethers.utils.parseEther("3680000"),
      experience: 58,
      experiencePerTier: 58 * 10,
    },
    {
      energy: 39,
      payout: ethers.utils.parseEther("3565000"),
      experience: 71,
      experiencePerTier: 71 * 4,
    },
    {
      energy: 36,
      payout: ethers.utils.parseEther("3910000"),
      experience: 66,
      experiencePerTier: 66 * 12,
    },
    {
      energy: 22,
      payout: ethers.utils.parseEther("2875000"),
      experience: 41,
      experiencePerTier: 41 * 5,
    },
    {
      energy: 54,
      payout: ethers.utils.parseEther("5462500"),
      experience: 81,
      experiencePerTier: 81 * 12,
    },
    {
      energy: 45,
      payout: ethers.utils.parseEther("5750000"),
      experience: 69,
      experiencePerTier: 69 * 12,
    },
    {
      energy: 40,
      payout: ethers.utils.parseEther("3450000"),
      experience: 75,
      experiencePerTier: 75 * 1,
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("60"),
  jobs: [
    {
      energy: 21,
      payout: ethers.utils.parseEther("4370000"),
      experience: 41,
      experiencePerTier: 41 * 10,
    },
    {
      energy: 45,
      payout: ethers.utils.parseEther("4830000"),
      experience: 81,
      experiencePerTier: 81 * 12,
    },
    {
      energy: 45,
      payout: ethers.utils.parseEther("4025000"),
      experience: 69,
      experiencePerTier: 69 * 5,
    },
    {
      energy: 45,
      payout: ethers.utils.parseEther("3450000"),
      experience: 78,
      experiencePerTier: 78 * 10,
    },
    {
      energy: 40,
      payout: ethers.utils.parseEther("4600000"),
      experience: 78,
      experiencePerTier: 78 * 8,
    },
    {
      energy: 49,
      payout: ethers.utils.parseEther("3220000"),
      experience: 92,
      experiencePerTier: 92 * 5,
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("7457000"),
      experience: 63,
      experiencePerTier: 63 * 15,
    },
    {
      energy: 32,
      payout: ethers.utils.parseEther("5520000"),
      experience: 60,
      experiencePerTier: 60 * 5,
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("100"),
  jobs: [
    {
      energy: 36,
      payout: ethers.utils.parseEther("5550000"),
      experience: 69,
      experiencePerTier: 69 * 10,
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("4662000"),
      experience: 67,
      experiencePerTier: 67 * 12,
    },
    {
      energy: 36,
      payout: ethers.utils.parseEther("8880000"),
      experience: 69,
      experiencePerTier: 69 * 5,
    },
    {
      energy: 39,
      payout: ethers.utils.parseEther("11100000"),
      experience: 74,
      experiencePerTier: 74 * 10,
    },
    {
      energy: 76,
      payout: ethers.utils.parseEther("19980000"),
      experience: 152,
      experiencePerTier: 152 * 8,
    },
    {
      energy: 36,
      payout: ethers.utils.parseEther("55500000"),
      experience: 69,
      experiencePerTier: 69 * 5,
    },
    {
      energy: 63,
      payout: ethers.utils.parseEther("17760000"),
      experience: 121,
      experiencePerTier: 121 * 15,
    },
    {
      energy: 46,
      payout: ethers.utils.parseEther("13764000"),
      experience: 90,
      experiencePerTier: 90 * 5,
    },
  ],
});

module.exports = {
  jobTiers,
};
