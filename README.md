# Blockchain Task Manager

A decentralized task management application built on Ethereum/Polygon that allows users to create, edit, complete, and delete tasks on the blockchain.

## Project Structure

- `contracts/`: Smart contract code
- `frontend/`: React frontend application
- `scripts/`: Deployment and utility scripts
- `test/`: Smart contract tests

## Smart Contract Features

- Create tasks with title and description
- Edit existing tasks
- Mark tasks as completed
- Delete tasks
- Task ownership verification
- Priority levels and due dates

## Prerequisites

- Node.js 16+ and npm/pnpm
- MetaMask browser extension
- Sepolia or Mumbai testnet ETH/MATIC

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your:
   - Infura/Alchemy API keys for Sepolia and Mumbai
   - Private key for deployment
   - Etherscan/Polygonscan API keys for verification

## Deploying the Smart Contract

### Deploying to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploying to Mumbai

```bash
npx hardhat run scripts/deploy.js --network mumbai
```

The deployment script will:
1. Compile the contract
2. Deploy it to the specified network
3. Wait for confirmations
4. Verify the contract on Etherscan/Polygonscan
5. Save deployment information to `deployments/{network}.json`
6. Update the frontend `.env.local` file with the contract address

## Verifying the Contract

The deployment script attempts to verify the contract automatically. If verification fails, you can manually verify using:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
# or
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

## Frontend Setup

After deploying the contract:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Update the `.env.local` file with your deployed contract addresses (the deployment script should do this automatically)

4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploying the Frontend

See the [frontend README](./frontend/README.md) for instructions on deploying the frontend to Vercel or Netlify.

## Testing

Run the smart contract tests:

```bash
npx hardhat test
```
