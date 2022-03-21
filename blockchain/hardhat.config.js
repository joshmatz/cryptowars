require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
// const { network } = require("hardhat");
const { types, task } = require("hardhat/config");

// When using the hardhat network, you may choose to fork Fuji or Avalanche Mainnet
// This will allow you to debug contracts using the hardhat network while keeping the current network state
// To enable forking, turn one of these booleans on, and then run your tasks/scripts using ``--network hardhat``
// For more information go to the hardhat guide
// https://hardhat.org/hardhat-network/
// https://hardhat.org/guides/mainnet-forking.html
const FORK_FUJI = false;
const FORK_MAINNET = false;
const forkingData = FORK_FUJI
  ? {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
    }
  : FORK_MAINNET
  ? {
      url: "https://api.avax.network/ext/bc/C/rpc",
    }
  : undefined;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("miningMode", "Changes the mining mode of hardhat")
  .addParam(
    "automine",
    "True/false to enable/disable automining",
    true,
    types.boolean
  )
  .addOptionalParam(
    "interval",
    "The interval to set in milliseconds (default 5000)",
    15000,
    types.int
  )
  .setAction(async ({ automine, interval }) => {
    await network.provider.send("evm_setAutomine", [automine]);
    console.log({ automine });
    if (!automine) {
      console.log("setting interval mining");
      await network.provider.send("evm_setIntervalMining", [interval]);
    }
  });

task("increaseTime", "Increases the time on the network")
  .addOptionalParam("time", "Time in minutes to increase", 60, types.int)
  .setAction(async ({ time }) => {
    await network.provider.send("evm_increaseTime", [time * 60]);
  });

//  npx hardhat addOwnerAsGameContract --type CryptoChar --address 0x406e5D7dDaA4029eB8B957aD7677c63e15c28AC7 --network localhost
task("addOwnerAsGameContract", "Adds the owner as a game contract")
  .addParam(
    "type",
    "The contract type to which you're appending the owner",
    "CryptoChar",
    types.string
  )
  .addParam("address", "Address of the contract", "0x0", types.address)
  .setAction(async ({ type, address }) => {
    const accounts = await hre.ethers.getSigners();

    const contract = await hre.ethers.getContractAt(type, address);
    await contract.addGameContract(accounts[0].address);
  });

// npx hardhat updateCharacterAttributes --address 0x406e5D7dDaA4029eB8B957aD7677c63e15c28AC7 --experience 1000000000000 --network localhost
task("updateCharacterAttributes", "Updates the character attributes")
  .addParam("address", "Address of the contract", "0x0", types.address)
  .addOptionalParam("characterId", "The character id", 0, types.int)
  .addOptionalParam("experience", "The experience", 0, types.int)
  .addOptionalParam("sp", "The skill points", 0, types.int)
  .addOptionalParam("health", "The health", 0, types.int)
  .addOptionalParam("energy", "The energy", 0, types.int)
  .addOptionalParam("stamina", "The stamina", 0, types.int)
  .setAction(
    async ({
      address,
      characterId,
      experience,
      sp,
      health,
      energy,
      stamina,
    }) => {
      const accounts = await hre.ethers.getSigners();

      const characterContract = await hre.ethers.getContractAt(
        "CryptoChar",
        address
      );
      const gameContracts = await characterContract.gameContracts(
        accounts[0].address
      );
      console.log({ gameContracts, experience });
      await characterContract.updateCurrentAttributes(
        characterId,
        experience,
        stamina,
        energy,
        health,
        sp
      );
    }
  );

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 5000,
      },
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      gasPrice: 247500000000,
      chainId: 43113,
      accounts: [`0x${process.env.AVALANCHE_TEST_PRIVATE_KEY}`],
    },
    mainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
