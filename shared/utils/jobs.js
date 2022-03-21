const { ethers, BigNumber } = require("ethers");

const jobTiers = [];

// 197 energy
const firstTierJobs = [
  {
    name: "Funnel some crypto",
    energy: 1,
    payout: ethers.utils.parseEther("350"),
    experience: 1,
    experiencePerTier: 1 * 10,
    requiredItemTypeNames: [],
    requiredItemTypeCounts: [],
    rewardItemTypeNames: [],
  },
  {
    name: "Scam a granny",
    energy: 3,
    payout: ethers.utils.parseEther("700"),
    experience: 3,
    experiencePerTier: 3 * 12,
    requiredItemTypeNames: [],
    requiredItemTypeCounts: [],
    rewardItemTypeNames: [],
  },
  {
    name: "Shill some coins",
    energy: 2,
    payout: ethers.utils.parseEther("944"),
    experience: 2,
    experiencePerTier: 2 * 13,
    requiredItemTypeNames: ["Crowbar"],
    requiredItemTypeCounts: [1],
    rewardItemTypeNames: [],
  },
  {
    name: "Rough up a bro",
    energy: 2,
    payout: ethers.utils.parseEther("1260"),
    experience: 2,
    experiencePerTier: 2 * 13,
    requiredItemTypeNames: ["Baseball Bat"],
    requiredItemTypeCounts: [1],
    rewardItemTypeNames: [],
  },
  {
    name: "Grow your discord",
    energy: 9,
    payout: ethers.utils.parseEther("630"),
    experience: 11,
    experiencePerTier: 11 * 9,
    requiredItemTypeNames: [],
    requiredItemTypeCounts: [],
    rewardItemTypeNames: [],
  },
  {
    name: "Perform a hit",
    energy: 25,
    payout: ethers.utils.parseEther("1500"),
    experience: 1,
    experiencePerTier: 1,
    requiredItemTypeNames: [],
    requiredItemTypeCounts: [],
    rewardItemTypeNames: [],
    // generally experience per tier requires 30% additional experience
  },
];

// 340 energy
const secondTierJobs = [
  {
    name: "Create a meme coin",
    energy: 2,
    payout: ethers.utils.parseEther("2280"),
    experience: 2,
    experiencePerTier: 36,
    requiredItemTypeNames: ["Crowbar"],
    requiredItemTypeCounts: [1],
    rewardItemTypeNames: ["Butterfly Knife"],
  },
  {
    name: "Scam a friend",
    energy: 3,
    payout: ethers.utils.parseEther("2623"),
    experience: 4,
    experiencePerTier: 36,
    requiredItemTypeNames: [".45 Cal Pistol"],
    requiredItemTypeCounts: [1],
    rewardItemTypeNames: ["Brass Knuckles"],
  },
  {
    name: "DDOS a competitor",
    energy: 3,
    payout: ethers.utils.parseEther("1840"),
    experience: 3,
    experiencePerTier: 39,
    requiredItemTypeNames: ["Tommy Gun", "Sedan"],
    requiredItemTypeCounts: [2, 2],
    rewardItemTypeNames: [".45 Revolver"],
  },
  {
    name: "Collect on a loan",
    energy: 4,
    payout: ethers.utils.parseEther("2760"),
    experience: 5,
    experiencePerTier: 40,
    requiredItemTypeNames: ["Tommy Gun", "Sedan"],
    requiredItemTypeCounts: [2, 3],
    rewardItemTypeNames: ["Tactical Shotgun"],
  },
  {
    name: "Skip KYC",
    energy: 8,
    payout: ethers.utils.parseEther("4600"),
    experience: 15,
    experiencePerTier: 150,
    requiredItemTypeNames: ["Motorcycle"],
    requiredItemTypeCounts: [1],
    rewardItemTypeNames: [],
  },
  {
    name: "The Heist",
    energy: 13,
    payout: ethers.utils.parseEther("5750"),
    experience: 23,
    experiencePerTier: 138,
    requiredItemTypeNames: ["Armored Sedan", "Tommy Gun"],
    requiredItemTypeCounts: [1, 3],
    rewardItemTypeNames: [],
  },
  {
    name: "Hijack a server",
    energy: 7,
    payout: "2280",
    experience: 9,
    experiencePerTier: 99,
    requiredItemTypeNames: ["Sawed-Off Shotgun", "Delivery Truck"],
    requiredItemTypeCounts: [2, 1],
    rewardItemTypeNames: [],
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
  name: "Soldier",
  level: ethers.utils.parseEther("9"),
  jobs: [
    {
      name: "Destroy a competitor's warehouse",
      energy: 5,
      payout: ethers.utils.parseEther("7360"),
      experience: 5,
      experiencePerTier: 75,
      requiredItemTypeNames: ["Tommy Gun", "Sedan"],
      requiredItemTypeCounts: [2, 3],
      rewardItemTypeNames: ["C4"],
    },
    {
      name: "Silence a snitch",
      energy: 5,
      payout: ethers.utils.parseEther("8096"),
      experience: 5,
      experiencePerTier: 50,
      requiredItemTypeNames: ["Tommy Gun", "Armored Sedan"],
      requiredItemTypeCounts: [3, 2],
      rewardItemTypeNames: [],
    },
    {
      name: "Create a false identity",
      energy: 5,
      payout: ethers.utils.parseEther("8740"),
      experience: 5,
      experiencePerTier: 25,
      requiredItemTypeNames: ["Tommy Gun", "Armored Sedan"],
      requiredItemTypeCounts: [3, 2],
      rewardItemTypeNames: ["Automatic Rifle"],
    },
    {
      name: "Hack a vault",
      energy: 6,
      payout: ethers.utils.parseEther("32200"),
      experience: 8,
      experiencePerTier: 96,
      requiredItemTypeNames: ["Sedan", "Machine Gun"],
      requiredItemTypeCounts: [3, 2],
      rewardItemTypeNames: [],
    },
    {
      name: "Create a botnet",
      energy: 5,
      payout: ethers.utils.parseEther("10120"),
      experience: 6,
      experiencePerTier: 60,
      requiredItemTypeNames: ["Chain Gun", "Sedan"],
      requiredItemTypeCounts: [1, 1],
      rewardItemTypeNames: ["Semi-Automatic Shotgun"],
    },
    {
      name: "Hack a bank",
      energy: 8,
      payout: ethers.utils.parseEther("20700"),
      experience: 13,
      experiencePerTier: 195,
      requiredItemTypeNames: ["Sedan", "Bullet Proof Vest", "Tactical Shotgun"],
      requiredItemTypeCounts: [3, 1, 2],
      rewardItemTypeNames: ["Lucky Shamrock Medallion"],
    },
    {
      name: "Steal some equipment",
      energy: 7,
      payout: ethers.utils.parseEther("22310"),
      experience: 9,
      experiencePerTier: 180,
      requiredItemTypeNames: ["Motorcycle", "Machine Gun"],
      requiredItemTypeCounts: [4, 4],
      rewardItemTypeNames: ["Firebomb"],
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("13"),
  jobs: [
    {
      name: "Central Exchange Hack",
      energy: 22,
      payout: ethers.utils.parseEther("115000"),
      experience: 35,
      experiencePerTier: 350,
      requiredItemTypeNames: ["Getaway Cruiser", "Tommy Gun", "Hand Grenade"],
      requiredItemTypeCounts: [3, 10, 10],
      rewardItemTypeNames: [],
    },
    {
      name: "Launder coins",
      energy: 16,
      payout: ethers.utils.parseEther("55200"),
      experience: 25,
      experiencePerTier: 125,
      requiredItemTypeNames: ["Chain Gun", "Armored Sedan"],
      requiredItemTypeCounts: [2, 2],
      rewardItemTypeNames: ["Armored Truck"],
    },
    {
      name: "Smuggle equipment",
      energy: 26,
      payout: ethers.utils.parseEther("517500"),
      experience: 41,
      experiencePerTier: 410,
      requiredItemTypeNames: ["Town Car", "Liquor"],
      requiredItemTypeCounts: [1, 20],
      rewardItemTypeNames: [],
    },
    {
      name: "Ransom a competitor's server",
      energy: 17,
      payout: ethers.utils.parseEther("690000"),
      experience: 38,
      experiencePerTier: 190,
      requiredItemTypeNames: ["Set of Tokens", "Set of Cards"],
      requiredItemTypeCounts: [20, 20],
      rewardItemTypeNames: [],
    },
    {
      name: "Wiretap officials",
      energy: 26,
      payout: ethers.utils.parseEther("2300000"),
      experience: 52,
      experiencePerTier: 520,
      requiredItemTypeNames: ["Tommy Gun", "Getaway Cruiser", "Wiretap Device"],
      requiredItemTypeCounts: [10, 3, 1],
      rewardItemTypeNames: [],
    },
    {
      name: "Rob Big Box Store",
      energy: 21,
      payout: ethers.utils.parseEther("333500"),
      experience: 29,
      experiencePerTier: 29 * 5,
      requiredItemTypeNames: [
        "Delivery Truck",
        "Bullet Proof Vest",
        "Tommy Gun",
      ],
      requiredItemTypeCounts: [2, 3, 5],
      // TODO: This wants 3 types of item rewards!
      rewardItemTypeNames: [
        "Computer Set-Up",
        "Untraceable Cell Phone",
        "Concealable Camera",
      ],
    },
    {
      name: "Burn down a server farm",
      energy: 16,
      payout: ethers.utils.parseEther("299000"),
      experience: 25,
      experiencePerTier: 250,
      requiredItemTypeNames: ["Sedan", "Firebomb", ".45 Revolver"],
      requiredItemTypeCounts: [2, 4, 2],
      rewardItemTypeNames: [],
    },
    {
      name: "Increase botnet size",
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 140,
      requiredItemTypeNames: [],
      requiredItemTypeCounts: [],
      rewardItemTypeNames: ["Liquor"],
    },
    {
      name: "Mint some tokens",
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 140,
      requiredItemTypeNames: [],
      requiredItemTypeCounts: [],
      rewardItemTypeNames: ["Set of Tokens"],
    },
    {
      name: "Rug a community",
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 140,
      requiredItemTypeNames: [],
      requiredItemTypeCounts: [],
      rewardItemTypeNames: ["Set of Cards"],
    },
    {
      name: "Overload a server farm",
      energy: 8,
      payout: ethers.utils.parseEther("0"),
      experience: 14,
      experiencePerTier: 140,
      requiredItemTypeNames: ["Getaway Cruiser", "Chain Gun"],
      requiredItemTypeCounts: [5, 10],
      rewardItemTypeNames: ["Wiretap Device"],
    },
  ],
});

jobTiers.push({
  name: "Hitman",
  level: ethers.utils.parseEther("18"),
  jobs: [
    {
      name: "Repel a botnet",
      energy: 11,
      payout: ethers.utils.parseEther("124200"),
      experience: 21,
      experiencePerTier: 210,
      requiredItemTypeNames: ["Chain Gun", "Machine Gun", "Armored Sedan"],
      requiredItemTypeCounts: [2, 5, 3],
      rewardItemTypeNames: ["Grenade Launcher"],
    },
    {
      name: "Disprupt rival DEX",
      energy: 13,
      payout: ethers.utils.parseEther("163300"),
      experience: 23,
      experiencePerTier: 276,
      requiredItemTypeNames: ["Chain Gun", "Hand Grenade", "Getaway Cruiser"],
      requiredItemTypeCounts: [2, 10, 1],
      rewardItemTypeNames: [".50 Caliber Rifle"],
    },
    {
      name: "Takeover veCOIN",
      energy: 22,
      payout: ethers.utils.parseEther("276000"),
      experience: 35,
      experiencePerTier: 385,
      requiredItemTypeNames: ["Chain Gun", "Body Armor", "Getaway Cruiser"],
      requiredItemTypeCounts: [5, 5, 3],
      rewardItemTypeNames: ["Armored Car"],
    },
    {
      name: "Sell equipment to the government",
      energy: 22,
      payout: ethers.utils.parseEther("1150000"),
      experience: 41,
      experiencePerTier: 41,
      requiredItemTypeNames: ["Chain Gun", "Getaway Cruiser", "Town Car"],
      requiredItemTypeCounts: [7, 3, 1],
      rewardItemTypeNames: ["RPG Launcher"],
    },
    {
      name: "Protect your server",
      energy: 31,
      payout: ethers.utils.parseEther("2530000"),
      experience: 58,
      experiencePerTier: 290,
      requiredItemTypeNames: ["Chain Gun", "Getaway Cruiser", "Town Car"],
      requiredItemTypeCounts: [10, 5, 2],
      rewardItemTypeNames: ["Bodyguard"],
    },
    {
      name: "Silence a competitor",
      energy: 31,
      payout: ethers.utils.parseEther("2875000"),
      experience: 58,
      experiencePerTier: 290,
      requiredItemTypeNames: ["Chain Gun", "Getaway Cruiser", "Town Car"],
      requiredItemTypeCounts: [15, 10, 4],
      rewardItemTypeNames: ["Night Vision Goggles"],
    },
    {
      name: "Shutdown rival discord",
      energy: 35,
      payout: ethers.utils.parseEther("3450000"),
      experience: 67,
      experiencePerTier: 670,
      requiredItemTypeNames: ["Armored Sedan", "Getaway Cruiser", "Town Car"],
      requiredItemTypeCounts: [20, 12, 6],
      rewardItemTypeNames: ["Napalm Bomb"],
    },
    {
      name: "Obtain blackmail material",
      energy: 24,
      payout: ethers.utils.parseEther("230000"),
      experience: 37,
      experiencePerTier: 370,
      requiredItemTypeNames: ["Concealable Camera"],
      requiredItemTypeCounts: [1],
      rewardItemTypeNames: ["Blackmail Photos"],
    },
    {
      name: "Frame a rival",
      energy: 23,
      payout: ethers.utils.parseEther("437000"),
      experience: 38,
      experiencePerTier: 456,
      requiredItemTypeNames: ["Town Car", "Wiretap Device"],
      requiredItemTypeCounts: [2, 2],
      rewardItemTypeNames: [],
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("25"),
  name: "Capo",
  jobs: [
    {
      name: "Steal a delivery",
      energy: 28,
      payout: ethers.utils.parseEther("1035000"),
      experience: 42,
      experiencePerTier: 420,
      requiredItemTypeNames: ["Body Armor", "Armored Truck", "Automatic Rifle"],
      requiredItemTypeCounts: [5, 2, 5],
      rewardItemTypeNames: ["Prop Plane"],
    },
    {
      name: "Force a competitor offline",
      energy: 31,
      payout: ethers.utils.parseEther("1150000"),
      experience: 46,
      experiencePerTier: 460,
      requiredItemTypeNames: [
        "Motorcycle",
        "Town Car",
        "Chain Gun",
        "Semi-Automatic Shotgun",
      ],
      requiredItemTypeCounts: [4, 5, 4, 4],
      rewardItemTypeNames: ["Chopper"],
    },
    {
      name: "Silence a snitch",
      energy: 22,
      payout: ethers.utils.parseEther("920000"),
      experience: 35,
      experiencePerTier: 35 * 12,
      requiredItemTypeNames: [
        "Getaway Cruiser",
        "Semi-Automatic Shotgun",
        "Untraceable Cell Phone",
      ],
      requiredItemTypeCounts: [4, 1, 1],
      rewardItemTypeNames: [],
    },
    {
      name: "Modify bank records",
      energy: 26,
      payout: ethers.utils.parseEther("966000"),
      experience: 42,
      experiencePerTier: 42 * 11,
      requiredItemTypeNames: ["Getaway Cruiser", "Armored Truck"],
      requiredItemTypeCounts: [2, 1],
      rewardItemTypeNames: ["Illegal Transaction Records"],
    },
    {
      name: "Loot confiscated coins",
      energy: 53,
      payout: ethers.utils.parseEther("1495000"),
      experience: 69,
      experiencePerTier: 69 * 10,
      requiredItemTypeNames: [
        "Body Armor",
        "Chain Gun",
        "Armored Truck",
        "Night Vision Goggles",
      ],
      requiredItemTypeCounts: [15, 15, 4, 2],
      rewardItemTypeNames: [],
    },
    {
      name: "Convert a shill",
      energy: 26,
      payout: ethers.utils.parseEther("1092500"),
      experience: 45,
      experiencePerTier: 45 * 15,
      requiredItemTypeNames: ["Town Car", "Tommy Gun", "Bodyguard"],
      requiredItemTypeCounts: [4, 4, 2],
      rewardItemTypeNames: [],
    },
    {
      name: "Use a stolen device",
      energy: 17,
      payout: ethers.utils.parseEther("966000"),
      experience: 31,
      experiencePerTier: 31 * 10,
      requiredItemTypeNames: [
        "Getaway Cruiser",
        "Town Car",
        "Untraceable Cell Phone",
      ],
      requiredItemTypeCounts: [2, 2, 1],
      rewardItemTypeNames: [],
    },
    {
      name: "Force a rival into submission",
      energy: 24,
      payout: ethers.utils.parseEther("1725000"),
      experience: 44,
      experiencePerTier: 44 * 9,
      requiredItemTypeNames: ["Town Car", "Bodyguard", ".45 Revolver"],
      requiredItemTypeCounts: [5, 2, 1],
      rewardItemTypeNames: [],
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("35"),
  jobs: [
    {
      name: "Influence an official",
      energy: 45,
      payout: ethers.utils.parseEther("3335000"),
      experience: 74,
      experiencePerTier: 74 * 5,
      requiredItemTypeNames: ["Blackmail Photos"],
      requiredItemTypeCounts: [1],
      rewardItemTypeNames: ["Luxury Yacht"],
    },
    {
      name: "Modify a public record",
      energy: 32,
      payout: ethers.utils.parseEther("3680000"),
      experience: 58,
      experiencePerTier: 58 * 10,
      requiredItemTypeNames: [
        "Delivery Truck",
        "Speed Boat",
        "Semi-Automatic Shotgun",
      ],
      requiredItemTypeCounts: [5, 2, 4],
      rewardItemTypeNames: [],
    },
    {
      name: "Snuff an activist",
      energy: 39,
      payout: ethers.utils.parseEther("3565000"),
      experience: 71,
      experiencePerTier: 71 * 4,
      requiredItemTypeNames: [
        "Town Car",
        "Hacksaw",
        "Automatic Rifle",
        ".50 Caliber Rifle",
      ],
      requiredItemTypeCounts: [6, 1, 2, 2],
      rewardItemTypeNames: [],
    },
    {
      name: "Hide a witness",
      energy: 36,
      payout: ethers.utils.parseEther("3910000"),
      experience: 66,
      experiencePerTier: 66 * 12,
      requiredItemTypeNames: ["Prop Plane"],
      requiredItemTypeCounts: [1],
      rewardItemTypeNames: [],
    },
    {
      name: "Dispose evidence",
      energy: 22,
      payout: ethers.utils.parseEther("2875000"),
      experience: 41,
      experiencePerTier: 41 * 5,
      requiredItemTypeNames: ["Speed Boat", "Hacksaw"],
      requiredItemTypeCounts: [1, 1],
      rewardItemTypeNames: [],
    },
    {
      name: "Ransom a family",
      energy: 54,
      payout: ethers.utils.parseEther("5462500"),
      experience: 81,
      experiencePerTier: 81 * 12,
      requiredItemTypeNames: [
        "Town Car",
        "Untraceable Cell Phone",
        "Automatic Rifle",
      ],
      requiredItemTypeCounts: [10, 1, 5],
      rewardItemTypeNames: ["GX9"],
    },
    {
      name: "Fix the election",
      energy: 45,
      payout: ethers.utils.parseEther("5750000"),
      experience: 69,
      experiencePerTier: 69 * 12,
      requiredItemTypeNames: ["Illegal Transaction Records", ".22 Pistol"],
      requiredItemTypeCounts: [1, 2],
      rewardItemTypeNames: ["Bookie's Holdout Pistol"],
    },
    {
      name: "Steal an equipment shipment",
      energy: 40,
      payout: ethers.utils.parseEther("3450000"),
      experience: 75,
      experiencePerTier: 75 * 1,
      requiredItemTypeNames: ["Speed Boat", "Chain Gun", "Grenade Launcher"],
      requiredItemTypeCounts: [2, 10, 2],
      rewardItemTypeNames: [],
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("60"),
  jobs: [
    {
      name: "Extort a corrupt official",
      energy: 21,
      payout: ethers.utils.parseEther("4370000"),
      experience: 41,
      experiencePerTier: 41 * 10,
      requiredItemTypeNames: ["Illegal Transaction Records"],
      requiredItemTypeCounts: [1],
      rewardItemTypeNames: [],
    },
    {
      name: "Embezzle funds",
      energy: 45,
      payout: ethers.utils.parseEther("4830000"),
      experience: 81,
      experiencePerTier: 81 * 12,
      requiredItemTypeNames: ["Illegal Transaction Records", "Computer Set-Up"],
      requiredItemTypeCounts: [1, 1],
      rewardItemTypeNames: [],
    },
    {
      name: "Break into a server farm",
      energy: 45,
      payout: ethers.utils.parseEther("4025000"),
      experience: 69,
      experiencePerTier: 69 * 5,
      requiredItemTypeNames: [
        "Body Armor",
        "Armored Truck",
        "Automatic Rifle",
        "Grenade Launcher",
      ],
      requiredItemTypeCounts: [12, 6, 5, 2],
      rewardItemTypeNames: ["Combat Truck"],
    },
    {
      name: "Rip off the federal police",
      energy: 45,
      payout: ethers.utils.parseEther("3450000"),
      experience: 78,
      experiencePerTier: 78 * 10,
      requiredItemTypeNames: [
        "Armored Truck",
        "Automatic Rifle",
        "Grenade Launcher",
      ],
      requiredItemTypeCounts: [2, 6, 2],
      rewardItemTypeNames: ["BA-12 Assault Rifle"],
    },
    {
      name: "Muscle in on a scandal",
      energy: 40,
      payout: ethers.utils.parseEther("4600000"),
      experience: 78,
      experiencePerTier: 78 * 8,
      requiredItemTypeNames: ["Body Armor", "Chain Gun", "Armored Car"],
      requiredItemTypeCounts: [10, 20, 4],
      rewardItemTypeNames: [],
    },
    {
      name: "Ambush a rival's discord",
      energy: 49,
      payout: ethers.utils.parseEther("3220000"),
      experience: 92,
      experiencePerTier: 92 * 5,
      requiredItemTypeNames: ["Town Car", "Chain Gun", "BA-12 Assault Rifle"],
      requiredItemTypeCounts: [4, 5, 1],
      rewardItemTypeNames: [],
    },
    {
      name: "Spambot a rival's Twitter",
      energy: 31,
      payout: ethers.utils.parseEther("7457000"),
      experience: 63,
      experiencePerTier: 63 * 15,
      requiredItemTypeNames: [
        "Getaway Cruiser",
        ".50 Caliber Rifle",
        "Untraceable Cell Phone",
      ],
      requiredItemTypeCounts: [4, 2, 1],
      rewardItemTypeNames: [],
    },
    {
      name: "Take over a drug cartel",
      energy: 32,
      payout: ethers.utils.parseEther("5520000"),
      experience: 60,
      experiencePerTier: 60 * 5,
      requiredItemTypeNames: ["Computer Set-Up"],
      requiredItemTypeCounts: [1],
      rewardItemTypeNames: ["Falsified Documents"],
    },
  ],
});

jobTiers.push({
  level: ethers.utils.parseEther("100"),
  jobs: [
    {
      name: "Disrupt official operations",
      energy: 36,
      payout: ethers.utils.parseEther("5550000"),
      experience: 69,
      experiencePerTier: 69 * 10,
      requiredItemTypeNames: [
        "Town Car",
        "Getaway Cruiser",
        "Chain Gun",
        "RPG Launcher",
      ],
      requiredItemTypeCounts: [10, 5, 14, 1],
      rewardItemTypeNames: [],
    },
    {
      name: "Bribe the police",
      energy: 31,
      payout: ethers.utils.parseEther("4662000"),
      experience: 67,
      experiencePerTier: 67 * 12,
      requiredItemTypeNames: ["Town Car", "Hand Grenade", "Blackmail Photos"],
      requiredItemTypeCounts: [2, 5, 1],
      rewardItemTypeNames: ["Federal Agent"],
    },
    {
      name: "Make a deal with a corrupt official",
      energy: 36,
      payout: ethers.utils.parseEther("8880000"),
      experience: 69,
      experiencePerTier: 69 * 5,
      requiredItemTypeNames: [
        "Prop Plane",
        "Night Vision Goggles",
        "Automatic Rifle",
      ],
      requiredItemTypeCounts: [3, 4, 10],
      rewardItemTypeNames: ["Private Jet"],
    },
    {
      name: "Blackmail a judge",
      energy: 39,
      payout: ethers.utils.parseEther("11100000"),
      experience: 74,
      experiencePerTier: 74 * 10,
      requiredItemTypeNames: ["Blackmail Photos", ".22 Pistol"],
      requiredItemTypeCounts: [1, 1],
      rewardItemTypeNames: ["Police Cruiser"],
    },
    {
      name: "Coerce the DA",
      energy: 76,
      payout: ethers.utils.parseEther("19980000"),
      experience: 152,
      experiencePerTier: 152 * 8,
      requiredItemTypeNames: ["Town Car", "Illegal Transaction Records"],
      requiredItemTypeCounts: [5, 1],
      rewardItemTypeNames: ["Stretch Limo"],
    },
    {
      name: "Apply pressure to a senator",
      energy: 36,
      payout: ethers.utils.parseEther("55500000"),
      experience: 69,
      experiencePerTier: 69 * 5,
      requiredItemTypeNames: [
        "Town Car",
        "Body Armor",
        "Chain Gun",
        "Bodyguard",
      ],
      requiredItemTypeCounts: [40, 20, 20, 4],
      rewardItemTypeNames: [],
    },
    {
      name: "Takeover a Central Exchange",
      energy: 63,
      payout: ethers.utils.parseEther("17760000"),
      experience: 121,
      experiencePerTier: 121 * 15,
      requiredItemTypeNames: [
        "Town Car",
        "Body Armor",
        "Chain Gun",
        "Bodyguard",
      ],
      requiredItemTypeCounts: [40, 20, 20, 4],
      rewardItemTypeNames: [],
    },
    {
      name: "Finish business",
      energy: 46,
      payout: ethers.utils.parseEther("13764000"),
      experience: 90,
      experiencePerTier: 90 * 5,
      requiredItemTypeNames: ["Private Jet"],
      requiredItemTypeCounts: [1],
      rewardItemTypeNames: [],
    },
  ],
});

module.exports = {
  jobTiers,
};
