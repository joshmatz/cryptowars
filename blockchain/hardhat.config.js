require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
const { GraphQLClient, gql } = require("graphql-request");
const { types } = require("hardhat/config");

const graphQLClient = new GraphQLClient(
  `https://api.thegraph.com/subgraphs/name/traderjoe-xyz/lending`,
  {}
);

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
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
  .setAction(async ({ automine, interval }, href) => {
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

task("findUnderwater", "Prints the list of accounts", async (taskArgs, hre) => {
  const query = gql`
    {
      accounts(where: { totalBorrowValueInUSD_gt: 1 }) {
        id
        health
        totalBorrowValueInUSD
        totalCollateralValueInUSD
        tokens {
          id
          enteredMarket
          symbol
          jTokenBalance

          market {
            exchangeRate
            underlyingPriceUSD
          }
          storedBorrowBalance
          totalUnderlyingSupplied
          totalUnderlyingRedeemed
          totalUnderlyingBorrowed
          totalUnderlyingRepaid
          supplyBalanceUnderlying
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  const accounts = [];
  data.accounts.forEach((account) => {
    const debt = {
      cumulativeBorrowValue: 0,
      cumulativeCollateralValue: 0,
      debtTokens: [],
      collateralTokens: [],
    };

    //
    // jTokenStats.storedBorrowBalance = event.params.accountBorrows
    // .toBigDecimal()
    // .div(exponentToBigDecimal(market.underlyingDecimals))
    // .truncate(market.underlyingDecimals)
    //

    // jTokenStatsTo.jTokenBalance.plus(
    //   event.params.amount
    //     .toBigDecimal()
    //     .div(jTokenDecimalsBD)
    //     .truncate(jTokenDecimals),
    // )

    account.tokens.forEach((token) => {
      const borrowBalanceUSD =
        token.storedBorrowBalance * token.market.underlyingPriceUSD;
      const collateralUSD =
        token.supplyBalanceUnderlying * token.market.underlyingPriceUSD;
      if (borrowBalanceUSD) {
        debt.cumulativeBorrowValue += borrowBalanceUSD;
        debt.debtTokens.push(token);
      }

      if (token.supplyBalanceUnderlying > 0 && token.enteredMarket) {
        debt.collateralTokens.push(token);
        debt.cumulativeCollateralValue += collateralUSD;
      }
    });

    // if (debt.cumulativeCollateralValue < debt.cumulativeBorrowValue) {
    accounts.push({
      // account: {
      //   health: account.health,
      //   id: account.id,
      //   totalBorrowValueInUSD: account.totalBorrowValueInUSD,
      //   totalCollateralValueInUSD: account.totalCollateralValueInUSD,
      // },
      address: account.id,
      collateralValue: debt.cumulativeCollateralValue.toLocaleString(),
      debtValue: debt.cumulativeBorrowValue.toLocaleString(),
      ratio: debt.cumulativeCollateralValue / debt.cumulativeBorrowValue,
      revenue: debt.cumulativeCollateralValue * 0.08,
    });
    // }
  });

  console.log(
    JSON.stringify(
      accounts.sort((a, b) => {
        if (a.ratio > b.ratio) {
          return -1;
        }
        // if (a.account.totalBorrowValueInUSD > b.account.totalBorrowValueInUSD) {
        //   return 1;
        // }

        return 1;
      }),
      undefined,
      2
    )
  );
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
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
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
