require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    amoy: {
      url: "https://rpc-amoy.polygon.technology", // Official RPC
      accounts: [process.env.PRIVATE_KEY], // Your MetaMask private key (never commit this!)
      chainId: 80002,
    },
  }
};
