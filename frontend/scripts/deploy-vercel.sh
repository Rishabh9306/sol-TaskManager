#!/bin/bash

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "You are not logged in to Vercel. Please login:"
    vercel login
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Error: .env.local file not found. Please create it from .env.example and fill in the required values."
    exit 1
fi

# Check if contract addresses are set
SEPOLIA_CONTRACT=$(grep NEXT_PUBLIC_TASK_MANAGER_CONTRACT_SEPOLIA .env.local | cut -d '=' -f2)
MUMBAI_CONTRACT=$(grep NEXT_PUBLIC_TASK_MANAGER_CONTRACT_MUMBAI .env.local | cut -d '=' -f2)

if [[ "$SEPOLIA_CONTRACT" == *"0x0000000000000000000000000000000000000000"* ]] && [[ "$MUMBAI_CONTRACT" == *"0x0000000000000000000000000000000000000000"* ]]; then
    echo "Error: Please set at least one contract address in .env.local"
    exit 1
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!" 