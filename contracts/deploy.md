# Hardhat Deployment Setup Guide

## Networks Configuration

The Hardhat configuration has been updated to include:

- **localhost**: Local development network [http://127.0.0.1:8545](http://127.0.0.1:8545)
- **sepolia**: Ethereum Sepolia testnet

## Environment Variables Setup

Update your `.env` file in the root directory with the following variables:

```env
# Sepolia Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_test_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Getting Sepolia ETH

1. **Create a test wallet** (if you don't have one):

    - Use MetaMask or any Ethereum wallet
    - Switch to Sepolia testnet
    - Copy your wallet address

2. **Get Sepolia ETH from faucets**:

    - [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)
    - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
    - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

3. **Export your private key**:
    - In MetaMask: Account Details → Export Private Key
    - **⚠️ Warning**: Never use a mainnet wallet or share your private key!

## Testing Network Connection

Test the Sepolia network connection:

```bash
# Navigate to contracts directory
cd contracts

# Test network connection
npx hardhat run scripts/send-op-tx.ts --network sepolia
```

## Contract Verification

To verify a deployed contract on Sepolia:

```bash
# Basic verification command
npx hardhat verify --network sepolia CONTRACT_ADDRESS "constructor_arg1" "constructor_arg2"

# Example with the Counter contract (if deployed)
npx hardhat verify --network sepolia 0xYourContractAddress

# Verify with constructor arguments
npx hardhat verify --network sepolia 0xYourContractAddress --constructor-args arguments.js
```

## Available Networks

- `localhost` - Local Hardhat node
- `sepolia` - Ethereum Sepolia testnet
- `hardhatMainnet` - Hardhat simulated mainnet
- `hardhatOp` - Hardhat simulated Optimism

## Common Commands

```bash
# Start local node
npx hardhat node

# Deploy to localhost
npx hardhat ignition deploy ./ignition/modules/Counter.ts --network localhost

# Deploy to Sepolia
npx hardhat ignition deploy ./ignition/modules/Counter.ts --network sepolia

# Run tests
npx hardhat test

# Clean artifacts
npx hardhat clean
```

## Setup Checklist

- [ ] Update SEPOLIA_RPC_URL in .env
- [ ] Add SEPOLIA_PRIVATE_KEY in .env
- [ ] Add ETHERSCAN_API_KEY in .env
- [ ] Get Sepolia ETH from faucet
- [ ] Test network connection
- [ ] Deploy and verify a test contract
