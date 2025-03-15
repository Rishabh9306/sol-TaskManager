# Smart Contract Verification Guide

This guide walks you through deploying and verifying your TaskManager smart contract on Etherscan (Sepolia) or Polygonscan (Mumbai).

## Prerequisites

Before you begin, ensure you have:

1. **API Keys**:
   - Etherscan API key (for Sepolia)
   - Polygonscan API key (for Mumbai)

2. **Environment Setup**:
   - Node.js and npm/pnpm installed
   - Hardhat installed (`npm install --save-dev hardhat`)
   - `.env` file configured with your private key and API keys

## Deployment and Verification Process

### Step 1: Configure Environment Variables

Create a `.env` file in your project root (if not already done):

```
# Network RPC URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MUMBAI_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY

# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

### Step 2: Deploy the Contract

Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Or deploy to Mumbai:
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

The script will:
- Deploy the contract
- Log the contract address
- Attempt automatic verification
- Save deployment info to `deployments/{network}.json`

### Step 3: Verify the Contract (if automatic verification fails)

#### Using Hardhat Verify Command

For Sepolia:
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

For Mumbai:
```bash
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

#### Obtaining the Deployed Contract Address

You can find the deployed contract address in:
1. The terminal output after deployment
2. The `deployments/{network}.json` file
3. Your frontend `.env.local` file (if it was updated by the deployment script)

### Step 4: Manual Verification (if needed)

If automatic verification fails, you can verify manually:

1. Go to the block explorer:
   - Sepolia: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
   - Mumbai: https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS

2. Click on the "Contract" tab

3. Click "Verify and Publish"

4. Fill in the verification form:
   - Select "Solidity (Single file)" as compiler type
   - Choose compiler version "0.8.17" (or match your hardhat.config.js)
   - Set optimization to "Yes" with 200 runs
   - Enter the contract source code
   - Submit for verification

## Troubleshooting Verification Errors

### 1. "Already Verified" Error

**Error**: `Contract source code already verified`

**Solution**: The contract is already verified. No action needed.

### 2. "Bytecode Mismatch" Error

**Error**: `The compiled contract and the onchain deployed bytecode don't match`

**Solutions**:
- Ensure you're using the exact same compiler version and settings as in deployment
- Check that your contract source code hasn't changed since deployment
- Verify that constructor arguments are correctly provided (if any)
- Try adding a delay after deployment before verification (2-3 minutes)

### 3. "Contract Creation Code Mismatch" Error

**Error**: `Unable to generate Contract ByteCode and ABI`

**Solutions**:
- Check that the Solidity version in your contract matches the one selected for verification
- Ensure all imported contracts are included in the verification
- Try using the "Solidity (Standard-Json-Input)" option for complex contracts

### 4. API Key Issues

**Error**: `Invalid API Key` or `API Key rate limit exceeded`

**Solutions**:
- Double-check your API key in the `.env` file
- Create a new API key if necessary
- Wait if you've exceeded the rate limit

### 5. Network Issues

**Error**: `Error in sending request for verification`

**Solutions**:
- Check your internet connection
- Ensure the block explorer is operational
- Try again later

## Advanced: Verifying Contracts with Constructor Arguments

If your contract has constructor arguments, you need to provide them during verification:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "arg1" "arg2"
```

For complex arguments, you can create a JavaScript file to encode them:

```javascript
// arguments.js
module.exports = [
  "First argument",
  "Second argument",
  // ...
];
```

Then run:
```bash
npx hardhat verify --network sepolia --constructor-args arguments.js DEPLOYED_CONTRACT_ADDRESS
```

## Verifying Library-Linked Contracts

If your contract uses libraries, you need to specify the library addresses:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS --libraries "LibraryName:0xLibraryAddress"
```

## Conclusion

After successful verification, your contract's source code will be publicly visible and verified on the block explorer. Users can interact with your contract directly through the block explorer's interface. 