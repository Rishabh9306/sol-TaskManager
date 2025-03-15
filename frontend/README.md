# Blockchain Task Manager Frontend

This is the frontend application for the Blockchain Task Manager, a decentralized application that allows users to create, edit, complete, and delete tasks on the Ethereum blockchain.

## Prerequisites

- Node.js 16+ and npm/pnpm
- MetaMask browser extension
- Deployed TaskManager smart contract on Sepolia or Mumbai testnet

## Setup

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```
4. Copy `.env.example` to `.env.local` and update the values:
   ```bash
   cp .env.example .env.local
   ```
5. Update the contract addresses in `.env.local` with your deployed contract addresses

## Development

Run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying to Vercel

### Option 1: Deploy from GitHub

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Set the Root Directory to "frontend" if your repository contains both frontend and smart contract code
   - Add Environment Variables from your `.env.local` file
6. Click "Deploy"

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project
5. Add environment variables when prompted or later in the Vercel dashboard

### Environment Variables on Vercel

Make sure to add the following environment variables in the Vercel dashboard:

- `NEXT_PUBLIC_DEFAULT_NETWORK`: The default network (sepolia or mumbai)
- `NEXT_PUBLIC_TASK_MANAGER_CONTRACT_SEPOLIA`: Your contract address on Sepolia
- `NEXT_PUBLIC_TASK_MANAGER_CONTRACT_MUMBAI`: Your contract address on Mumbai
- `NEXT_PUBLIC_INFURA_API_KEY` (optional): Your Infura API key
- `NEXT_PUBLIC_ALCHEMY_API_KEY` (optional): Your Alchemy API key
- `NEXT_PUBLIC_ETHERSCAN_API_KEY` (optional): Your Etherscan API key

## Features

- Connect to MetaMask wallet
- View all tasks stored on the blockchain
- Add new tasks
- Edit existing tasks
- Mark tasks as completed
- Delete tasks
- Automatic network detection and switching

## Technologies Used

- Next.js
- React
- ethers.js
- Tailwind CSS
- shadcn/ui components
- TypeScript 