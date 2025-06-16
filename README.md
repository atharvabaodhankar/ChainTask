# ChainTask

A full-stack dApp for managing tasks, built with React, Vite, Hardhat, and Solidity. Supports deployment to both a local Hardhat network and the Polygon Amoy Testnet.

## Prerequisites
- Node.js & npm
- MetaMask extension

## 1. Local Hardhat Deployment

### Backend (Smart Contracts)
1. Install dependencies:
   ```bash
   cd blockchain
   npm install
   ```
2. Start a local Hardhat node:
   ```bash
   npx hardhat node
   ```
3. Deploy contracts to the local network:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Frontend
1. In a new terminal, install frontend dependencies:
   ```bash
   cd ../
   npm install
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```
3. Connect MetaMask to `http://localhost:8545` (Hardhat local network).

## 2. Polygon Amoy Testnet Deployment

### Backend (Smart Contracts)
1. Get test POL from a faucet (see `.env` for faucet URL if running locally).
2. Configure your wallet and Hardhat for Amoy:
   - Update `hardhat.config.cjs` with your Amoy RPC and private key.
3. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```

### Frontend
1. Start the frontend:
   ```bash
   npm run dev
   ```
2. Connect MetaMask to Polygon Amoy (Chain ID: 80002, Symbol: POL, RPC: https://rpc-amoy.polygon.technology/).

## Environment Variables
- `.env` contains configuration such as the faucet URL for local testing.

## Useful Links
- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)

---
For more details, see the contract and frontend source code.
