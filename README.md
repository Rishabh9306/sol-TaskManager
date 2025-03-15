# Blockchain-Based Task Manager

A decentralized task management application built on Ethereum/Polygon that allows users to create, edit, complete, and delete tasks on the blockchain.

## Features

- Create tasks with title, description, priority level, and due date
- Edit existing tasks
- Mark tasks as completed or uncompleted
- Delete tasks
- View all your tasks
- Filter tasks by completion status, priority level, or due date
- Secure ownership - only task owners can modify their tasks
- Admin controls for contract management
- Gas-optimized for efficient blockchain operations

## Smart Contract

The TaskManager smart contract is built with Solidity and includes:

- Task struct with ID, title, description, completion status, owner, priority, due date, and creation timestamp
- Efficient storage using mappings
- Access control to ensure only task owners can modify their tasks
- Admin functions restricted with OpenZeppelin's Ownable
- Pausable functionality for emergency situations
- Events for frontend notifications
- Task filtering capabilities
- Gas optimizations to reduce transaction costs

## Gas Optimizations

The contract includes several gas optimizations:

1. **Use of `calldata` instead of `memory`** for function parameters that don't need to be modified
2. **Minimized state variable writes** by checking if values have changed before updating
3. **Use of `external` instead of `public`** for functions not called internally
4. **Efficient storage access** by using local storage pointers
5. **Conditional event emissions** to avoid unnecessary operations
6. **Optimized task deletion** using the swap-and-pop pattern

## Access Control

The contract implements two levels of access control:

1. **Task-level access control**: Only the owner of a task can edit, complete, or delete it
   - Enforced with `require(msg.sender == task.owner)` checks

2. **Admin-level access control**: Contract owner has special privileges
   - Uses OpenZeppelin's `Ownable` contract with `onlyOwner` modifier
   - Admin can pause/unpause the contract
   - Admin can set maximum tasks per user
   - Admin can delete any task in emergency situations
   - Admin can view global statistics

## Events

The contract emits the following events:

- `TaskAdded(uint256 taskId, address owner, string title, Priority priority, uint256 dueDate)`
- `TaskUpdated(uint256 taskId, string newTitle, string newDescription, Priority priority, uint256 dueDate)`
- `TaskCompleted(uint256 taskId, bool completed)`
- `TaskDeleted(uint256 taskId)`
- `ContractPaused(bool paused)`
- `MaxTasksPerUserChanged(uint256 maxTasks)`

## Tech Stack

- **Smart Contract**: Solidity ^0.8.0
- **Development Environment**: Hardhat
- **Testing**: Chai & Mocha
- **Deployment Networks**: Ethereum Sepolia, Polygon Mumbai
- **RPC Providers**: Infura or Alchemy
- **Frontend** (to be implemented): React, Ethers.js, TailwindCSS

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask wallet
- Infura or Alchemy API key
- Testnet ETH/MATIC (from faucets)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd blockchain-task-manager
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your values:
   ```
   cp .env.example .env
   ```
   
   Required environment variables:
   ```
   SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   # or
   MUMBAI_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID
   
   PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
   
   ETHERSCAN_API_KEY=your_etherscan_api_key
   # or
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   ```

4. Compile the smart contract:
   ```
   npx hardhat compile
   ```

### Testing

Run the test suite to ensure everything is working correctly:

```
npx hardhat test
```

### Local Development

Start a local Hardhat node:

```
npx hardhat node
```

In a separate terminal, deploy the contract to the local network:

```
npx hardhat run scripts/deploy.js --network localhost
```

### Deployment to Testnet

Deploy to Sepolia testnet:

```
npm run deploy:sepolia
```

Deploy to Mumbai testnet:

```
npm run deploy:mumbai
```

The deployment script will:
1. Connect to the specified network using your Infura/Alchemy API key
2. Deploy the TaskManager contract using your wallet
3. Wait for confirmation of the deployment
4. Verify the contract on Etherscan/Polygonscan
5. Output a deployment summary with the contract address and transaction details

## Contract Usage Examples

### Creating a Task

```javascript
// Create a task with default priority (Medium) and no due date
const tx1 = await taskManager.addTask("Complete project", "Finish the blockchain task manager");
await tx1.wait();

// Create a high priority task with a due date
const dueDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
const tx2 = await taskManager.addTask("Urgent task", "Must be done ASAP", 2, dueDate);
await tx2.wait();
```

### Fetching Tasks

```javascript
// Fetch all tasks
const allTasks = await taskManager.fetchAllTasks();

// Fetch only completed tasks
const completedTasks = await taskManager.fetchTasksByStatus(true);

// Fetch only high priority tasks
const highPriorityTasks = await taskManager.fetchTasksByPriority(2);

// Fetch tasks due within the next 24 hours
const urgentTasks = await taskManager.fetchTasksDueSoon();
```

### Managing Tasks

```javascript
// Complete a task
const tx1 = await taskManager.completeTask(taskId);
await tx1.wait();

// Mark a completed task as not completed
const tx2 = await taskManager.uncompleteTask(taskId);
await tx2.wait();

// Edit a task
const tx3 = await taskManager.editTask(taskId, "New title", "New description", 1, newDueDate);
await tx3.wait();

// Delete a task
const tx4 = await taskManager.deleteTask(taskId);
await tx4.wait();
```

### Admin Functions

```javascript
// Pause the contract in emergency situations
await taskManager.setPaused(true);

// Unpause the contract
await taskManager.setPaused(false);

// Set maximum tasks per user
await taskManager.setMaxTasksPerUser(50);

// Delete any task (admin only)
await taskManager.adminDeleteTask(taskId);

// Get total task count across all users
const totalTasks = await taskManager.getTotalTaskCount();
```

## Contract Address

- Sepolia: `<to-be-filled-after-deployment>`
- Mumbai: `<to-be-filled-after-deployment>`

## License

MIT 