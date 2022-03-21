// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const hoursToSeconds = require("date-fns/hoursToSeconds");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const { jobTiers } = require("shared/utils/jobs");
const { propertyTypes } = require("shared/utils/properties");
const { itemTypes } = require("shared/utils/items");

const getItemTypeId = (itemTypeName) => {
  const found = itemTypes.findIndex(
    (itemType) => itemType.name.toLowerCase() === itemTypeName.toLowerCase()
  );
  if (found === -1) {
    console.error("Item Type Not Found for", itemTypeName);
    return 0;
  }
  return found;
};

const propertyTypePropsToArray = (props) => {
  return [
    props.cost,
    props.costPerLevel,
    props.incomePerLevel,
    props.maxLevel,
    props.maxCollection,
  ];
};

const jobPropsToArray = (props) => {
  return [
    props.energy,
    props.payout,
    props.experience,
    props.experiencePerTier,
    props.requiredItemTypeNames.map(getItemTypeId),
    props.requiredItemTypeCounts,
    props.rewardItemTypeNames.map(getItemTypeId),
  ];
};

const itemTypePropsToArray = (props) => {
  return [props.class, props.attack, props.defense, props.rarity];
};

const transactions = [];

const deployCharacterContract = async () => {
  if (process.env.CHARACTER_CONTRACT_ADDRESS) {
    console.log("Skipping Character Contract Deployment");
    return process.env.CHARACTER_CONTRACT_ADDRESS;
  }
  const CryptoChar = await ethers.getContractFactory("CryptoChar");
  const cryptoChar = await CryptoChar.deploy();
  transactions.push(await cryptoChar.deployed());
  console.log(`CHARACTER_CONTRACT_ADDRESS=${cryptoChar.address}`);

  return cryptoChar.address;
};

const deployCryptoNYERC20Contract = async () => {
  if (process.env.ERC20_CONTRACT_ADDRESS) {
    console.log("Skipping ERC20 Contract Deployment");
    return process.env.ERC20_CONTRACT_ADDRESS;
  }

  const CryptoNYERC20 = await ethers.getContractFactory("CryptoNYERC20");
  const cryptoNyERC20 = await CryptoNYERC20.deploy();
  transactions.push(await cryptoNyERC20.deployed());
  console.log(`ERC20_CONTRACT_ADDRESS=${cryptoNyERC20.address}`);
  return cryptoNyERC20.address;
};

const deployCryptoNYWallet = async (characterAddress, ERC20Address) => {
  if (process.env.WALLET_CONTRACT_ADDRESS) {
    console.log("Skipping Wallet Deployment");
    return process.env.WALLET_CONTRACT_ADDRESS;
  }
  const CryptoNYWallet = await ethers.getContractFactory("CryptoNYWallet");
  const cryptoNyWallet = await CryptoNYWallet.deploy(
    characterAddress,
    ERC20Address
  );

  const cryptoNyERC20Contract = await ethers.getContractAt(
    "CryptoNYERC20",
    ERC20Address
  );

  transactions.push(await cryptoNyWallet.deployed());
  console.log(`WALLET_CONTRACT_ADDRESS=${cryptoNyWallet.address}`);

  transactions.push(
    await cryptoNyERC20Contract.transferOwnership(cryptoNyWallet.address)
  );
  console.log("Wallet Ownership Transferred");

  transactions.push(
    await cryptoNyERC20Contract.approve(
      cryptoNyWallet.address,
      ethers.constants.MaxUint256
    )
  );
  console.log("Contract approved");

  return cryptoNyWallet.address;
};

const deployCryptoPropertiesContract = async (
  characterAddress,
  walletAddress
) => {
  if (process.env.PROPERTIES_CONTRACT_ADDRESS) {
    console.log("Skipping Properties Deployment");
    return process.env.PROPERTIES_CONTRACT_ADDRESS;
  }
  const CryptoNYProperties = await ethers.getContractFactory(
    "CryptoNYProperties"
  );
  const cryptoNyProperties = await CryptoNYProperties.deploy(characterAddress);
  transactions.push(await cryptoNyProperties.deployed());
  console.log(`PROPERTIES_CONTRACT_ADDRESS=${cryptoNyProperties.address}`);

  const characterContract = await ethers.getContractAt(
    "CryptoChar",
    characterAddress
  );
  transactions.push(
    await characterContract._addRegion(
      0,
      60 * 60 * 9,
      cryptoNyProperties.address
    )
  );
  console.log("Region Added");

  transactions.push(await cryptoNyProperties.setWalletContract(walletAddress));
  console.log("Wallet approved in Properties");

  const walletContract = await ethers.getContractAt(
    "CryptoNYWallet",
    walletAddress
  );
  transactions.push(
    await walletContract.addGameContract(cryptoNyProperties.address)
  );
  console.log("Properties approved in Wallet");

  return cryptoNyProperties.address;
};

const deployJobsContract = async (
  characterAddress,
  walletAddress,
  itemsAddress
) => {
  if (process.env.JOBS_CONTRACT_ADDRESS) {
    console.log("Skipping Jobs Deployment");
    return process.env.JOBS_CONTRACT_ADDRESS;
  }
  const CryptoNYJobs = await ethers.getContractFactory("CryptoNYJobs");

  const cryptoNyJobs = await CryptoNYJobs.deploy(
    characterAddress,
    walletAddress,
    itemsAddress
  );
  transactions.push(await cryptoNyJobs.deployed());
  console.log(`JOBS_CONTRACT_ADDRESS=${cryptoNyJobs.address}`);

  const walletContract = await ethers.getContractAt(
    "CryptoNYWallet",
    walletAddress
  );
  transactions.push(await walletContract.addGameContract(cryptoNyJobs.address));
  console.log("Jobs approved in Wallet");

  const characterContract = await ethers.getContractAt(
    "CryptoChar",
    characterAddress
  );
  transactions.push(
    await characterContract.addGameContract(cryptoNyJobs.address)
  );
  console.log("Jobs approved in CryptoChar");

  return cryptoNyJobs.address;
};

const deployItemContract = async (characterAddress) => {
  if (process.env.ITEM_CONTRACT_ADDRESS) {
    console.log("Skipping Item Deployment");
    return process.env.ITEM_CONTRACT_ADDRESS;
  }
  const CryptoNYItem = await ethers.getContractFactory("CryptoNYItems");
  const itemContract = await CryptoNYItem.deploy(characterAddress);
  transactions.push(await itemContract.deployed());
  console.log(`ITEM_CONTRACT_ADDRESS=${itemContract.address}`);

  const characterContract = await ethers.getContractAt(
    "CryptoChar",
    characterAddress
  );
  transactions.push(
    await characterContract.addGameContract(itemContract.address)
  );
  console.log("Item approved in CryptoChar");

  return itemContract.address;
};

const deployFightContract = async (characterAddress, walletAddress) => {
  // address _charContract,
  // address _walletContract,
  // address _itemsContract

  if (process.env.FIGHT_CONTRACT_ADDRESS) {
    console.log("Skipping Fight Deployment");
    return process.env.FIGHT_CONTRACT_ADDRESS;
  }

  const CryptoNYFight = await ethers.getContractFactory("CryptoNYFight");
  const fightContract = await CryptoNYFight.deploy(
    characterAddress,
    walletAddress
  );
  transactions.push(await fightContract.deployed());
  console.log(`FIGHT_CONTRACT_ADDRESS=${fightContract.address}`);

  const characterContract = await ethers.getContractAt(
    "CryptoChar",
    characterAddress
  );
  transactions.push(
    await characterContract.addGameContract(fightContract.address)
  );
  console.log("Fight approved in CryptoChar");

  return fightContract.address;
};

async function main({
  setProperties = true,
  setItems = true,
  setJobs = true,
} = {}) {
  let cryptoChar;
  let owner;
  let guest;
  let cryptoNyProperties;
  let cryptoNyERC20;
  let cryptoNyWallet;
  let cryptoNyJobs;

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const signers = await ethers.getSigners();
  owner = signers[0];
  guest = signers[1];

  let characterAddress;
  let ERC20Address;
  let walletAddress;
  let propertiesAddress;
  let jobsAddress;
  let itemsAddress;
  let fightAddress;

  characterAddress = await deployCharacterContract();
  ERC20Address = await deployCryptoNYERC20Contract();
  walletAddress = await deployCryptoNYWallet(characterAddress, ERC20Address);
  propertiesAddress = await deployCryptoPropertiesContract(
    characterAddress,
    walletAddress
  );
  itemsAddress = await deployItemContract(characterAddress, walletAddress);
  jobsAddress = await deployJobsContract(
    characterAddress,
    walletAddress,
    itemsAddress
  );
  fightAddress = await deployFightContract(characterAddress, walletAddress);

  /**
   * Set up wallet
   */

  if (guest) {
    console.log("guest");
    const c = await ethers.getContractAt("CryptoNYERC20", ERC20Address);
    transactions.push(
      await c.connect(guest).approve(walletAddress, ethers.constants.MaxUint256)
    );
    console.log("guest approval complete");
  }

  /**
   * Set up Properties
   */
  if (setProperties) {
    propertiesContract = await ethers.getContractAt(
      "CryptoNYProperties",
      propertiesAddress
    );
    const startingProperty = 0;
    for (
      let propertyId = startingProperty;
      propertyId < propertyTypes.length;
      propertyId++
    ) {
      transactions.push(
        await propertiesContract._createPropertyType(
          propertyId,
          ...propertyTypePropsToArray(propertyTypes[propertyId])
        )
      );
      console.log(`Property ${propertyId} Type Created`);
    }

    console.log("Properties completed");
  }

  /**
   * Set up jobs
   */

  if (setJobs) {
    let startingTier = 0;

    const jobsContract = await ethers.getContractAt(
      "CryptoNYJobs",
      jobsAddress
    );
    transactions.push(await jobsContract._createJobTiers(jobTiers.length));
    console.log("Jobs Tier Created");

    let startingJob = 0;
    startingTier = 0;
    for (let tierId = startingTier; tierId < jobTiers.length; tierId++) {
      for (
        let jobId = startingJob;
        jobId < jobTiers[tierId].jobs.length;
        jobId++
      ) {
        let isJobPublished = false;

        const job = await jobsContract.jobTier(tierId, jobId);

        if (job.energy.toNumber()) {
          isJobPublished = true;
        }
        try {
          if (!isJobPublished) {
            await jobsContract._setJobType(
              tierId,
              jobId,
              ...jobPropsToArray(jobTiers[tierId].jobs[jobId])
            );
            console.log(`Job Tier ${tierId} Job ${jobId} Created`);
          } else {
            console.log(`Job Tier ${tierId} Job ${jobId} Already Published`);
          }
        } catch (e) {
          console.log({ tierId, jobId, job: jobTiers[tierId].jobs[jobId], e });
          break;
        }
      }
    }
  }

  if (setItems) {
    const itemsContract = await ethers.getContractAt(
      "CryptoNYItems",
      itemsAddress
    );

    // createItemTypes
    for (let itemTypeId = 0; itemTypeId < itemTypes.length; itemTypeId++) {
      const itemType = await itemsContract.itemTypes(itemTypeId);
      if (itemType.class === 0) {
        transactions.push(
          await itemsContract._createItemType(
            itemTypeId,
            ...itemTypePropsToArray(itemTypes[itemTypeId])
          )
        );
        console.log(`Item Type ${itemTypeId} Created`);
      } else {
        console.log(`Item Type ${itemTypeId} Already Published`);
      }
    }
  }

  /**
   * Calculate Gas Costs
   */
  let gastotal = BigNumber.from(0);
  for (let i = 0; i < transactions.length; i++) {
    const receipt = await ethers.provider.getTransactionReceipt(
      transactions[i].deployTransaction?.hash || transactions[i].hash
    );
    // Use https://www.cryptoneur.xyz/gas-fees-calculator to look up cost to deploy
    gastotal = gastotal.add(receipt?.gasUsed || 0);
  }

  console.log("Gas to deploy: ", gastotal.toString());

  console.log(`NEXT_PUBLIC_CHARACTER_CONTRACT_ADDRESS=${characterAddress}`);
  console.log(`NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS=${walletAddress}`);
  console.log(`NEXT_PUBLIC_PROPERTIES_CONTRACT_ADDRESS=${propertiesAddress}`);
  console.log(`NEXT_PUBLIC_JOBS_CONTRACT_ADDRESS=${jobsAddress}`);
  console.log(`NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS=${ERC20Address}`);
  console.log(`NEXT_PUBLIC_ITEMS_CONTRACT_ADDRESS=${itemsAddress}`);
  console.log(`NEXT_PUBLIC_FIGHT_CONTRACT_ADDRESS=${fightAddress}`);

  return {
    owner,
    guest,
    characterAddress,
    walletAddress,
    propertiesAddress,
    jobsAddress,
    ERC20Address,
    itemsAddress,
    fightAddress,
    propertyTypes,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// const deployPromise = main()
//   .then(() => {})
//   .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
//   });

module.exports = {
  // deployPromise,
  main,
};
