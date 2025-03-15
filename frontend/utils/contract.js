import { ethers } from 'ethers';
import { getSigner, getCurrentNetwork, switchNetwork } from './ethers';

// TaskManager contract ABI - includes only the functions we need
const TaskManagerABI = [
  // Read functions
  "function fetchAllTasks() external view returns (tuple(uint256 id, string title, string description, bool completed, address owner, uint8 priority, uint256 dueDate, uint256 createdAt)[] memory)",
  "function getTask(uint256 taskId) external view returns (tuple(uint256 id, string title, string description, bool completed, address owner, uint8 priority, uint256 dueDate, uint256 createdAt) memory)",
  
  // Write functions
  "function addTask(string calldata title, string calldata description) external returns (uint256)",
  "function editTask(uint256 taskId, string calldata newTitle, string calldata newDescription) external",
  "function completeTask(uint256 taskId) external",
  "function deleteTask(uint256 taskId) external",
  
  // Events
  "event TaskAdded(uint256 taskId, address owner, string title, uint8 priority, uint256 dueDate)",
  "event TaskUpdated(uint256 taskId, string newTitle, string newDescription, uint8 priority, uint256 dueDate)",
  "event TaskCompleted(uint256 taskId, bool completed)",
  "event TaskDeleted(uint256 taskId)"
];

// Network configuration
const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111 in hex
    contractAddress: process.env.NEXT_PUBLIC_TASK_MANAGER_CONTRACT_SEPOLIA
  },
  MUMBAI: {
    chainId: '0x13881', // 80001 in hex
    contractAddress: process.env.NEXT_PUBLIC_TASK_MANAGER_CONTRACT_MUMBAI
  }
};

// Default network from environment variable
const DEFAULT_NETWORK = process.env.NEXT_PUBLIC_DEFAULT_NETWORK?.toUpperCase() || 'SEPOLIA';

/**
 * Get the contract address for the current network
 * @returns {Promise<string>} Contract address
 */
const getContractAddress = async () => {
  try {
    // Get current network
    const chainId = await getCurrentNetwork();
    
    // Determine which network we're on
    let networkName;
    if (chainId === NETWORKS.SEPOLIA.chainId) {
      networkName = 'SEPOLIA';
    } else if (chainId === NETWORKS.MUMBAI.chainId) {
      networkName = 'MUMBAI';
    } else {
      // If we're on an unsupported network, try to switch to the default
      console.warn(`Unsupported network with chainId ${chainId}. Attempting to switch to ${DEFAULT_NETWORK}.`);
      await switchNetwork(DEFAULT_NETWORK);
      networkName = DEFAULT_NETWORK;
    }
    
    const contractAddress = NETWORKS[networkName].contractAddress;
    
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`Contract address not configured for ${networkName} network`);
    }
    
    return contractAddress;
  } catch (error) {
    console.error("Error getting contract address:", error);
    throw error;
  }
};

/**
 * Get contract instance with connected signer
 * @returns {Promise<ethers.Contract>} Contract instance with signer
 */
const getContractWithSigner = async () => {
  try {
    const signer = await getSigner();
    const contractAddress = await getContractAddress();
    return new ethers.Contract(contractAddress, TaskManagerABI, signer);
  } catch (error) {
    console.error("Error getting contract with signer:", error);
    throw error;
  }
};

/**
 * Fetch all tasks from the blockchain
 * @returns {Promise<Array>} Array of task objects
 */
export const getAllTasks = async () => {
  try {
    const contract = await getContractWithSigner();
    const tasks = await contract.fetchAllTasks();
    
    // Transform the tasks array to a more usable format
    return tasks.map(task => ({
      id: Number(task.id),
      title: task.title,
      description: task.description,
      completed: task.completed,
      owner: task.owner,
      priority: Number(task.priority),
      dueDate: task.dueDate > 0 ? new Date(Number(task.dueDate) * 1000) : null,
      createdAt: new Date(Number(task.createdAt) * 1000)
    }));
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    throw error;
  }
};

/**
 * Add a new task to the blockchain
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @returns {Promise<number>} ID of the newly created task
 */
export const addTask = async (title, description) => {
  try {
    const contract = await getContractWithSigner();
    
    // Send the transaction
    const tx = await contract.addTask(title, description);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Find the TaskAdded event in the transaction logs
    const event = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(event => event && event.name === 'TaskAdded');
    
    // Return the task ID from the event
    return event ? Number(event.args.taskId) : null;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

/**
 * Edit an existing task on the blockchain
 * @param {number} taskId - ID of the task to edit
 * @param {string} newTitle - New task title
 * @param {string} newDescription - New task description
 * @returns {Promise<void>}
 */
export const editTask = async (taskId, newTitle, newDescription) => {
  try {
    const contract = await getContractWithSigner();
    
    // Send the transaction
    const tx = await contract.editTask(taskId, newTitle, newDescription);
    
    // Wait for the transaction to be mined
    await tx.wait();
  } catch (error) {
    console.error(`Error editing task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Mark a task as completed on the blockchain
 * @param {number} taskId - ID of the task to complete
 * @returns {Promise<void>}
 */
export const completeTask = async (taskId) => {
  try {
    const contract = await getContractWithSigner();
    
    // Send the transaction
    const tx = await contract.completeTask(taskId);
    
    // Wait for the transaction to be mined
    await tx.wait();
  } catch (error) {
    console.error(`Error completing task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Delete a task from the blockchain
 * @param {number} taskId - ID of the task to delete
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  try {
    const contract = await getContractWithSigner();
    
    // Send the transaction
    const tx = await contract.deleteTask(taskId);
    
    // Wait for the transaction to be mined
    await tx.wait();
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get a single task by ID
 * @param {number} taskId - ID of the task to fetch
 * @returns {Promise<Object>} Task object
 */
export const getTask = async (taskId) => {
  try {
    const contract = await getContractWithSigner();
    const task = await contract.getTask(taskId);
    
    return {
      id: Number(task.id),
      title: task.title,
      description: task.description,
      completed: task.completed,
      owner: task.owner,
      priority: Number(task.priority),
      dueDate: task.dueDate > 0 ? new Date(Number(task.dueDate) * 1000) : null,
      createdAt: new Date(Number(task.createdAt) * 1000)
    };
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
}; 