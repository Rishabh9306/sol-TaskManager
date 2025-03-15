# GitHub Repository Structure Guide

This guide outlines the recommended structure for organizing your Blockchain Task Manager project on GitHub.

## Repository Structure

```
sol-TaskManager/
├── smart_contract/              # Smart contract code and related files
│   ├── contracts/               # Solidity smart contract source files
│   │   └── TaskManager.sol      # Main TaskManager contract
│   ├── scripts/                 # Deployment and utility scripts
│   │   ├── deploy.js            # Main deployment script
│   │   └── utils/               # Helper utilities
│   ├── test/                    # Smart contract tests
│   │   └── TaskManager.test.js  # Tests for TaskManager contract
│   ├── artifacts/               # Compiled contract artifacts (generated)
│   │   └── contracts/           # Contract ABIs and bytecode
│   ├── deployments/             # Deployment records by network
│   │   ├── sepolia.json         # Sepolia deployment info
│   │   └── mumbai.json          # Mumbai deployment info
│   ├── hardhat.config.js        # Hardhat configuration
│   └── .env.example             # Environment variables template
│
├── frontend/                    # Frontend application
│   ├── app/                     # Next.js app directory
│   ├── components/              # React components
│   ├── utils/                   # Utility functions
│   │   ├── contract.js          # Contract interaction utilities
│   │   └── ethers.js            # Ethereum provider utilities
│   ├── public/                  # Static assets
│   ├── styles/                  # CSS and styling
│   ├── .env.example             # Frontend environment variables template
│   └── package.json             # Frontend dependencies
│
├── deployment_scripts/          # Additional deployment utilities
│   ├── verify.js                # Contract verification script
│   └── update-frontend.js       # Script to update frontend with contract info
│
├── docs/                        # Documentation
│   ├── verification-guide.md    # Contract verification guide
│   ├── repository-structure.md  # This file
│   └── api-examples.md          # API usage examples
│
├── .gitignore                   # Git ignore file
├── LICENSE                      # Project license
└── README.md                    # Main project README
```

## Setting Up This Structure

### 1. Initial Repository Setup

```bash
# Create the main directories
mkdir -p sol-TaskManager/{smart_contract/{contracts,scripts,test,artifacts,deployments},frontend,deployment_scripts,docs}

# Navigate to the project root
cd sol-TaskManager

# Initialize git repository
git init
```

### 2. Including Contract ABI Files

The contract ABI (Application Binary Interface) is essential for frontend interaction with your smart contract. Here's how to include it:

#### Option 1: Copy from Artifacts (Recommended)

After compiling your contract with Hardhat, copy the ABI from the artifacts directory:

```bash
# Compile the contract first
cd smart_contract
npx hardhat compile

# Create a directory for ABIs in the frontend
mkdir -p ../frontend/utils/abis

# Copy the ABI file
cp artifacts/contracts/TaskManager.sol/TaskManager.json ../frontend/utils/abis/
```

#### Option 2: Generate a Simplified ABI File

For a cleaner approach, you can extract just the ABI portion:

```javascript
// scripts/extract-abi.js
const fs = require('fs');
const path = require('path');

// Path to the compiled contract
const contractArtifact = require('../artifacts/contracts/TaskManager.sol/TaskManager.json');

// Extract just the ABI
const abi = contractArtifact.abi;

// Write to a JSON file in the frontend directory
fs.writeFileSync(
  path.join(__dirname, '../../frontend/utils/abis/TaskManagerABI.json'),
  JSON.stringify(abi, null, 2)
);

console.log('ABI extracted successfully!');
```

Run this script after compilation:
```bash
node scripts/extract-abi.js
```

### 3. Importing the ABI in Frontend Code

In your frontend code, import the ABI like this:

```javascript
// Option 1: If you copied the full artifact
import TaskManagerArtifact from '../utils/abis/TaskManager.json';
const TaskManagerABI = TaskManagerArtifact.abi;

// Option 2: If you extracted just the ABI
import TaskManagerABI from '../utils/abis/TaskManagerABI.json';

// Use the ABI to create a contract instance
const taskManager = new ethers.Contract(contractAddress, TaskManagerABI, signer);
```

## Cloning and Running the Project

Include these instructions in your README.md for users who want to clone and run your project:

```markdown
## Cloning and Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sol-TaskManager.git
   cd sol-TaskManager
   ```

2. Set up the smart contract:
   ```bash
   cd smart_contract
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npx hardhat compile
   npx hardhat test
   ```

3. Deploy to a local network:
   ```bash
   npx hardhat node
   # In a new terminal
   npx hardhat run scripts/deploy.js --network localhost
   ```

4. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser
```

## Best Practices for Repository Management

1. **Use .gitignore**: Ensure your `.gitignore` file excludes:
   - Node modules
   - Environment files (.env)
   - Build artifacts (except ABIs needed for the frontend)
   - IDE-specific files

2. **Protect Sensitive Information**:
   - Never commit private keys or API keys
   - Use environment variables for all sensitive information
   - Include `.env.example` files with placeholder values

3. **Versioning**:
   - Use semantic versioning for releases
   - Tag important releases (e.g., `v1.0.0`)

4. **Branch Strategy**:
   - `main`: Production-ready code
   - `develop`: Integration branch for features
   - Feature branches: For new features or fixes

5. **Documentation**:
   - Keep README.md updated
   - Document all major components
   - Include setup instructions and examples

## Migrating Your Current Project to This Structure

If you already have a project and want to reorganize it to match this structure:

1. Create the new directories
2. Move files to their appropriate locations
3. Update import paths in your code
4. Update deployment scripts to reflect the new structure
5. Test everything works after the reorganization

## Conclusion

Following this repository structure will help keep your project organized, making it easier for contributors to understand and work with your code. It also follows industry best practices for separating concerns between smart contract code and frontend application code. 