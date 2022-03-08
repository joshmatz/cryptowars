const { ethers, BigNumber } = require("ethers");

const jobTiers = [];

// 197 energy
const firstTierJobs = [
  {
    name: "",
    energy: 1,
    payout: ethers.utils.parseEther("350"),
    experience: 1,
    experiencePerTier: 1 * 10,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
  },
  {
    energy: 3,
    payout: ethers.utils.parseEther("700"),
    experience: 3,
    experiencePerTier: 3 * 12,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
  },
  {
    energy: 2,
    payout: ethers.utils.parseEther("944"),
    experience: 2,
    experiencePerTier: 2 * 13,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
  },
  {
    energy: 2,
    payout: ethers.utils.parseEther("1260"),
    experience: 2,
    experiencePerTier: 2 * 13,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
  },
  {
    energy: 9,
    payout: ethers.utils.parseEther("630"),
    experience: 11,
    experiencePerTier: 11 * 9,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
  },
  {
    energy: 25,
    payout: ethers.utils.parseEther("1500"),
    experience: 1,
    experiencePerTier: 1,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
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
    rewardItemTypeName: "Butterfly Knife",
  },
  {
    energy: 3,
    payout: ethers.utils.parseEther("2623"),
    experience: 4,
    experiencePerTier: 36,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "Pair of Brass Knuckles",
  },
  {
    energy: 3,
    payout: ethers.utils.parseEther("1840"),
    experience: 3,
    experiencePerTier: 39,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: ".45 Revolver",
  },
  {
    energy: 4,
    payout: ethers.utils.parseEther("2760"),
    experience: 5,
    experiencePerTier: 40,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "Tactical Shotgun",
  },
  {
    energy: 8,
    payout: ethers.utils.parseEther("4600"),
    experience: 15,
    experiencePerTier: 150,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
  },
  {
    energy: 13,
    payout: ethers.utils.parseEther("5750"),
    experience: 23,
    experiencePerTier: 138,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
  },
  {
    energy: 7,
    payout: "2280",
    experience: 9,
    experiencePerTier: 99,
    requiredItems: [],
    requiredItemCounts: [],
    rewardItemTypeName: "",
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
      rewardItemTypeName: "C4",
    },
    {
      energy: 5,
      payout: ethers.utils.parseEther("8096"),
      experience: 5,
      experiencePerTier: 50,
      rewardItemTypeName: "",
    },
    {
      energy: 5,
      payout: ethers.utils.parseEther("8740"),
      experience: 5,
      experiencePerTier: 25,
      rewardItemTypeName: "Automatic Rifle",
    },
    {
      energy: 6,
      payout: ethers.utils.parseEther("32200"),
      experience: 8,
      experiencePerTier: 96,
      rewardItemTypeName: "",
    },
    {
      energy: 5,
      payout: ethers.utils.parseEther("10120"),
      experience: 6,
      experiencePerTier: 60,
      rewardItemTypeName: "Semi-Automatic Shotgun",
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("20700"),
      experience: 13,
      experiencePerTier: 195,
      rewardItemTypeName: "Lucky Shamrock Medallion",
    },
    {
      energy: 7,
      payout: ethers.utils.parseEther("22310"),
      experience: 9,
      experiencePerTier: 180,
      rewardItemTypeName: "Firebomb",
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
      rewardItemTypeName: "",
    },
    {
      energy: 16,
      payout: ethers.utils.parseEther("55200"),
      experience: 25,
      experiencePerTier: 125,
      rewardItemTypeName: "Armored Truck",
    },
    {
      energy: 26,
      payout: ethers.utils.parseEther("517500"),
      experience: 41,
      experiencePerTier: 410,
      rewardItemTypeName: "",
    },
    {
      energy: 17,
      payout: ethers.utils.parseEther("690000"),
      experience: 38,
      experiencePerTier: 190,
      rewardItemTypeName: "",
    },

    {
      energy: 16,
      payout: ethers.utils.parseEther("299000"),
      experience: 25,
      experiencePerTier: 250,
      rewardItemTypeName: "",
    },
    {
      energy: 26,
      payout: ethers.utils.parseEther("2300000"),
      experience: 52,
      experiencePerTier: 520,
      rewardItemTypeName: "",
    },
    {
      energy: 21,
      payout: ethers.utils.parseEther("333500"),
      experience: 29,
      experiencePerTier: 29 * 5,
      // TODO: This wants 3 types of item rewards!
      rewardItemTypeName: "Computer Set-Up",
    },
    {
      energy: 16,
      payout: ethers.utils.parseEther("299000"),
      experience: 25,
      experiencePerTier: 250,
      rewardItemTypeName: "",
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 14000,
      rewardItemTypeName: "",
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 14000,
      rewardItemTypeName: "",
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 14000,
      rewardItemTypeName: "",
    },
    {
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 14000,
      rewardItemTypeName: "",
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
      rewardItemTypeName: "",
    },
    {
      energy: 13,
      payout: ethers.utils.parseEther("163300"),
      experience: 23,
      experiencePerTier: 276,
      rewardItemTypeName: "",
    },
    {
      energy: 22,
      payout: ethers.utils.parseEther("276000"),
      experience: 35,
      experiencePerTier: 385,
      rewardItemTypeName: "",
    },
    {
      energy: 22,
      payout: ethers.utils.parseEther("1150000"),
      experience: 41,
      experiencePerTier: 41,
      rewardItemTypeName: "",
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("2530000"),
      experience: 58,
      experiencePerTier: 290,
      rewardItemTypeName: "",
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("2875000"),
      experience: 58,
      experiencePerTier: 290,
      rewardItemTypeName: "",
    },
    {
      energy: 35,
      payout: ethers.utils.parseEther("3450000"),
      experience: 67,
      experiencePerTier: 670,
      rewardItemTypeName: "",
    },
    {
      energy: 24,
      payout: ethers.utils.parseEther("230000"),
      experience: 37,
      experiencePerTier: 370,
      rewardItemTypeName: "",
    },
    {
      energy: 23,
      payout: ethers.utils.parseEther("437000"),
      experience: 38,
      experiencePerTier: 456,
      rewardItemTypeName: "",
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
      rewardItemTypeName: "",
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("1150000"),
      experience: 46,
      experiencePerTier: 460,
      rewardItemTypeName: "",
    },
    {
      energy: 22,
      payout: ethers.utils.parseEther("920000"),
      experience: 35,
      experiencePerTier: 35 * 12,
      rewardItemTypeName: "",
    },
    {
      energy: 26,
      payout: ethers.utils.parseEther("966000"),
      experience: 42,
      experiencePerTier: 42 * 11,
      rewardItemTypeName: "",
    },
    {
      energy: 53,
      payout: ethers.utils.parseEther("1495000"),
      experience: 69,
      experiencePerTier: 69 * 10,
      rewardItemTypeName: "",
    },
    {
      energy: 26,
      payout: ethers.utils.parseEther("1092500"),
      experience: 45,
      experiencePerTier: 45 * 15,
      rewardItemTypeName: "",
    },
    {
      energy: 17,
      payout: ethers.utils.parseEther("966000"),
      experience: 31,
      experiencePerTier: 31 * 10,
      rewardItemTypeName: "",
    },
    {
      energy: 24,
      payout: ethers.utils.parseEther("1725000"),
      experience: 44,
      experiencePerTier: 44 * 9,
      rewardItemTypeName: "",
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
      rewardItemTypeName: "",
    },
    {
      energy: 32,
      payout: ethers.utils.parseEther("3680000"),
      experience: 58,
      experiencePerTier: 58 * 10,
      rewardItemTypeName: "",
    },
    {
      energy: 39,
      payout: ethers.utils.parseEther("3565000"),
      experience: 71,
      experiencePerTier: 71 * 4,
      rewardItemTypeName: "",
    },
    {
      energy: 36,
      payout: ethers.utils.parseEther("3910000"),
      experience: 66,
      experiencePerTier: 66 * 12,
      rewardItemTypeName: "",
    },
    {
      energy: 22,
      payout: ethers.utils.parseEther("2875000"),
      experience: 41,
      experiencePerTier: 41 * 5,
      rewardItemTypeName: "",
    },
    {
      energy: 54,
      payout: ethers.utils.parseEther("5462500"),
      experience: 81,
      experiencePerTier: 81 * 12,
      rewardItemTypeName: "",
    },
    {
      energy: 45,
      payout: ethers.utils.parseEther("5750000"),
      experience: 69,
      experiencePerTier: 69 * 12,
      rewardItemTypeName: "",
    },
    {
      energy: 40,
      payout: ethers.utils.parseEther("3450000"),
      experience: 75,
      experiencePerTier: 75 * 1,
      rewardItemTypeName: "",
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
      rewardItemTypeName: "",
    },
    {
      energy: 45,
      payout: ethers.utils.parseEther("4830000"),
      experience: 81,
      experiencePerTier: 81 * 12,
      rewardItemTypeName: "",
    },
    {
      energy: 45,
      payout: ethers.utils.parseEther("4025000"),
      experience: 69,
      experiencePerTier: 69 * 5,
      rewardItemTypeName: "",
    },
    {
      energy: 45,
      payout: ethers.utils.parseEther("3450000"),
      experience: 78,
      experiencePerTier: 78 * 10,
      rewardItemTypeName: "",
    },
    {
      energy: 40,
      payout: ethers.utils.parseEther("4600000"),
      experience: 78,
      experiencePerTier: 78 * 8,
      rewardItemTypeName: "",
    },
    {
      energy: 49,
      payout: ethers.utils.parseEther("3220000"),
      experience: 92,
      experiencePerTier: 92 * 5,
      rewardItemTypeName: "",
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("7457000"),
      experience: 63,
      experiencePerTier: 63 * 15,
      rewardItemTypeName: "",
    },
    {
      energy: 32,
      payout: ethers.utils.parseEther("5520000"),
      experience: 60,
      experiencePerTier: 60 * 5,
      rewardItemTypeName: "",
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
      rewardItemTypeName: "",
    },
    {
      energy: 31,
      payout: ethers.utils.parseEther("4662000"),
      experience: 67,
      experiencePerTier: 67 * 12,
      rewardItemTypeName: "",
    },
    {
      energy: 36,
      payout: ethers.utils.parseEther("8880000"),
      experience: 69,
      experiencePerTier: 69 * 5,
      rewardItemTypeName: "",
    },
    {
      energy: 39,
      payout: ethers.utils.parseEther("11100000"),
      experience: 74,
      experiencePerTier: 74 * 10,
      rewardItemTypeName: "",
    },
    {
      energy: 76,
      payout: ethers.utils.parseEther("19980000"),
      experience: 152,
      experiencePerTier: 152 * 8,
      rewardItemTypeName: "",
    },
    {
      energy: 36,
      payout: ethers.utils.parseEther("55500000"),
      experience: 69,
      experiencePerTier: 69 * 5,
      rewardItemTypeName: "",
    },
    {
      energy: 63,
      payout: ethers.utils.parseEther("17760000"),
      experience: 121,
      experiencePerTier: 121 * 15,
      rewardItemTypeName: "",
    },
    {
      energy: 46,
      payout: ethers.utils.parseEther("13764000"),
      experience: 90,
      experiencePerTier: 90 * 5,
      rewardItemTypeName: "",
    },
  ],
});

module.exports = {
  jobTiers,
};
