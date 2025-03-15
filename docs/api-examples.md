# TaskManager Smart Contract API Examples

This document provides examples of how to interact with the TaskManager smart contract using ethers.js in various JavaScript environments.

## Contract ABI

To interact with the contract, you'll need the contract ABI (Application Binary Interface). You can import it from your artifacts:

```javascript
// Option 1: Import from artifacts
import TaskManagerArtifact from '../artifacts/contracts/TaskManager.sol/TaskManager.json';
const TaskManagerABI = TaskManagerArtifact.abi;

// Option 2: Import from a dedicated ABI file
import TaskManagerABI from '../utils/abis/TaskManagerABI.json';
```

## Setting Up the Contract Connection

### Basic Setup with ethers.js

```javascript
import { ethers } from 'ethers';

// Contract address (replace with your deployed contract address)
const contractAddress = "0x1234567890123456789012345678901234567890";

// Connect to provider (MetaMask)
async function connectContract() {
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed!');
  }
  
  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  // Create provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Create contract instance
  const taskManager = new ethers.Contract(contractAddress, TaskManagerABI, signer);
  
  return taskManager;
}
```

### Using the Contract Utilities from the Project

If you're using the utilities provided in this project:

```javascript
import { connectWallet, getSigner } from '../utils/ethers';
import { getContract } from '../utils/contract';

async function getTaskManager() {
  // Connect wallet
  await connectWallet();
  
  // Get contract instance
  const taskManager = await getContract();
  
  return taskManager;
}
```

## Task Management Operations

### Fetching All Tasks

```javascript
async function getAllTasks() {
  try {
    const taskManager = await connectContract();
    const tasks = await taskManager.fetchAllTasks();
    
    // Transform the tasks to a more usable format
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
    console.error("Error fetching tasks:", error);
    throw error;
  }
}
```

### Creating a New Task

```javascript
async function createTask(title, description) {
  try {
    const taskManager = await connectContract();
    
    // Estimate gas (optional)
    const gasEstimate = await taskManager.addTask.estimateGas(title, description);
    console.log(`Estimated gas: ${gasEstimate.toString()}`);
    
    // Send the transaction
    const tx = await taskManager.addTask(title, description);
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Find the TaskAdded event
    const event = receipt.logs
      .map(log => {
        try {
          return taskManager.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(event => event && event.name === 'TaskAdded');
    
    // Return the task ID
    return event ? Number(event.args.taskId) : null;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}
```

### Creating a Task with Priority and Due Date

```javascript
async function createAdvancedTask(title, description, priority, dueDate) {
  try {
    const taskManager = await connectContract();
    
    // Convert JavaScript Date to Unix timestamp
    const dueDateTimestamp = dueDate ? Math.floor(dueDate.getTime() / 1000) : 0;
    
    // Send the transaction
    const tx = await taskManager.addTask(title, description, priority, dueDateTimestamp);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Find the TaskAdded event
    const event = receipt.logs
      .map(log => {
        try {
          return taskManager.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(event => event && event.name === 'TaskAdded');
    
    // Return the task ID
    return event ? Number(event.args.taskId) : null;
  } catch (error) {
    console.error("Error creating advanced task:", error);
    throw error;
  }
}
```

### Editing a Task

```javascript
async function editTask(taskId, newTitle, newDescription) {
  try {
    const taskManager = await connectContract();
    
    // Send the transaction
    const tx = await taskManager.editTask(taskId, newTitle, newDescription);
    
    // Wait for the transaction to be mined
    await tx.wait();
    
    console.log(`Task ${taskId} updated successfully`);
  } catch (error) {
    console.error(`Error editing task ${taskId}:`, error);
    throw error;
  }
}
```

### Completing a Task

```javascript
async function completeTask(taskId) {
  try {
    const taskManager = await connectContract();
    
    // Send the transaction
    const tx = await taskManager.completeTask(taskId);
    
    // Wait for the transaction to be mined
    await tx.wait();
    
    console.log(`Task ${taskId} marked as completed`);
  } catch (error) {
    console.error(`Error completing task ${taskId}:`, error);
    throw error;
  }
}
```

### Deleting a Task

```javascript
async function deleteTask(taskId) {
  try {
    const taskManager = await connectContract();
    
    // Send the transaction
    const tx = await taskManager.deleteTask(taskId);
    
    // Wait for the transaction to be mined
    await tx.wait();
    
    console.log(`Task ${taskId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
}
```

## Filtering and Querying Tasks

### Get Tasks by Completion Status

```javascript
async function getTasksByStatus(completed) {
  try {
    const taskManager = await connectContract();
    const tasks = await taskManager.fetchTasksByStatus(completed);
    
    // Transform the tasks to a more usable format
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
    console.error(`Error fetching tasks by status (completed=${completed}):`, error);
    throw error;
  }
}
```

### Get Tasks by Priority

```javascript
async function getTasksByPriority(priority) {
  try {
    const taskManager = await connectContract();
    const tasks = await taskManager.fetchTasksByPriority(priority);
    
    // Transform the tasks to a more usable format
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
    console.error(`Error fetching tasks by priority (${priority}):`, error);
    throw error;
  }
}
```

### Get Tasks Due Soon

```javascript
async function getTasksDueSoon() {
  try {
    const taskManager = await connectContract();
    const tasks = await taskManager.fetchTasksDueSoon();
    
    // Transform the tasks to a more usable format
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
    console.error("Error fetching tasks due soon:", error);
    throw error;
  }
}
```

## Event Listening

### Listen for Task Added Events

```javascript
function listenForNewTasks(callback) {
  const taskManager = await connectContract();
  
  // Listen for TaskAdded events
  taskManager.on("TaskAdded", (taskId, owner, title, priority, dueDate, event) => {
    console.log(`New task added: ${title} (ID: ${taskId})`);
    
    // Call the callback with the new task info
    callback({
      id: Number(taskId),
      title,
      owner,
      priority: Number(priority),
      dueDate: dueDate > 0 ? new Date(Number(dueDate) * 1000) : null
    });
  });
  
  // Return a function to stop listening
  return () => {
    taskManager.removeAllListeners("TaskAdded");
  };
}
```

### Listen for Task Completed Events

```javascript
function listenForCompletedTasks(callback) {
  const taskManager = await connectContract();
  
  // Listen for TaskCompleted events
  taskManager.on("TaskCompleted", (taskId, completed, event) => {
    console.log(`Task ${taskId} completion status changed to: ${completed}`);
    
    // Call the callback with the task info
    callback({
      id: Number(taskId),
      completed
    });
  });
  
  // Return a function to stop listening
  return () => {
    taskManager.removeAllListeners("TaskCompleted");
  };
}
```

## React Hook Example

Here's an example of a React hook that fetches tasks:

```jsx
import { useState, useEffect } from 'react';
import { connectContract } from '../utils/contract';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const taskManager = await connectContract();
        const rawTasks = await taskManager.fetchAllTasks();
        
        // Transform the tasks
        const formattedTasks = rawTasks.map(task => ({
          id: Number(task.id),
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: Number(task.priority),
          dueDate: task.dueDate > 0 ? new Date(Number(task.dueDate) * 1000) : null,
          createdAt: new Date(Number(task.createdAt) * 1000)
        }));
        
        if (isMounted) {
          setTasks(formattedTasks);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTasks();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { tasks, loading, error };
}
```

## Error Handling

Here's an example of how to handle common errors:

```javascript
async function safeContractCall(fn, ...args) {
  try {
    const taskManager = await connectContract();
    return await fn(taskManager, ...args);
  } catch (error) {
    // Handle specific error types
    if (error.code === 'ACTION_REJECTED') {
      console.error('Transaction was rejected by the user');
      throw new Error('Transaction rejected. Please confirm the transaction in MetaMask.');
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('Insufficient funds for gas');
      throw new Error('You do not have enough ETH to pay for this transaction.');
    }
    
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      console.error('Cannot estimate gas');
      throw new Error('Transaction may fail. Check if you own this task.');
    }
    
    // Network errors
    if (error.message.includes('network')) {
      console.error('Network error');
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Contract-specific errors
    if (error.message.includes('Contract is paused')) {
      console.error('Contract is paused');
      throw new Error('The contract is currently paused. Please try again later.');
    }
    
    // Fallback
    console.error('Unexpected error:', error);
    throw error;
  }
}

// Example usage
async function safeCompleteTask(taskId) {
  return safeContractCall(async (contract, id) => {
    const tx = await contract.completeTask(id);
    await tx.wait();
    return true;
  }, taskId);
}
```

## Conclusion

These examples demonstrate how to interact with the TaskManager smart contract using ethers.js. You can adapt these examples to your specific needs and integrate them into your frontend application. 