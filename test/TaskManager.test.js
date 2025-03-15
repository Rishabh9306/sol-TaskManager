const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TaskManager", function () {
  let TaskManager;
  let taskManager;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Priority enum values
  const Priority = {
    Low: 0,
    Medium: 1,
    High: 2
  };

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    TaskManager = await ethers.getContractFactory("TaskManager");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new TaskManager contract before each test
    taskManager = await TaskManager.deploy();
    await taskManager.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await taskManager.owner()).to.equal(owner.address);
    });

    it("Should have zero tasks initially", async function () {
      expect(await taskManager.getTaskCount()).to.equal(0);
    });
    
    it("Should initialize with default admin settings", async function () {
      expect(await taskManager.isPaused()).to.equal(false);
      expect(await taskManager.getMaxTasksPerUser()).to.equal(100);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause and unpause the contract", async function () {
      // Pause the contract
      await taskManager.setPaused(true);
      expect(await taskManager.isPaused()).to.equal(true);
      
      // Try to add a task while paused
      await expect(
        taskManager.addTask("Test Task", "This is a test task")
      ).to.be.revertedWith("Contract is paused");
      
      // Unpause the contract
      await taskManager.setPaused(false);
      expect(await taskManager.isPaused()).to.equal(false);
      
      // Should be able to add a task now
      await taskManager.addTask("Test Task", "This is a test task");
      expect(await taskManager.getTaskCount()).to.equal(1);
    });
    
    it("Should prevent non-owners from pausing the contract", async function () {
      await expect(
        taskManager.connect(addr1).setPaused(true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should allow owner to set max tasks per user", async function () {
      await taskManager.setMaxTasksPerUser(5);
      expect(await taskManager.getMaxTasksPerUser()).to.equal(5);
      
      // Add 5 tasks (should work)
      for (let i = 0; i < 5; i++) {
        await taskManager.addTask(`Task ${i}`, `Description ${i}`);
      }
      
      // Try to add a 6th task (should fail)
      await expect(
        taskManager.addTask("Task 6", "Description 6")
      ).to.be.revertedWith("Maximum number of tasks reached");
    });
    
    it("Should allow owner to delete any task", async function () {
      // User creates a task
      await taskManager.connect(addr1).addTask("User Task", "Created by user");
      
      // Owner deletes the task
      await taskManager.adminDeleteTask(0);
      
      // Check that the task was deleted
      expect(await taskManager.connect(addr1).getTaskCount()).to.equal(0);
    });
    
    it("Should allow owner to get total task count", async function () {
      // Different users create tasks
      await taskManager.connect(addr1).addTask("User 1 Task", "Created by user 1");
      await taskManager.connect(addr2).addTask("User 2 Task", "Created by user 2");
      await taskManager.connect(addr1).addTask("User 1 Task 2", "Created by user 1");
      
      // Check total task count
      expect(await taskManager.getTotalTaskCount()).to.equal(3);
    });
    
    it("Should prevent non-owners from accessing admin functions", async function () {
      await expect(
        taskManager.connect(addr1).setMaxTasksPerUser(10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        taskManager.connect(addr1).adminDeleteTask(0)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        taskManager.connect(addr1).getTotalTaskCount()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Task Operations", function () {
    it("Should create a new task with default values correctly", async function () {
      const tx = await taskManager.addTask("Test Task", "This is a test task");
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.events.find(e => e.event === 'TaskAdded');
      expect(event).to.not.be.undefined;
      expect(event.args.title).to.equal("Test Task");
      expect(event.args.priority).to.equal(Priority.Medium);
      
      // Check task count
      expect(await taskManager.getTaskCount()).to.equal(1);
      
      // Check task details
      const task = await taskManager.getTask(0);
      expect(task.id).to.equal(0);
      expect(task.title).to.equal("Test Task");
      expect(task.description).to.equal("This is a test task");
      expect(task.completed).to.equal(false);
      expect(task.owner).to.equal(owner.address);
      expect(task.priority).to.equal(Priority.Medium);
      expect(task.dueDate).to.equal(0);
    });

    it("Should create a new task with custom priority and due date", async function () {
      const currentTime = await time.latest();
      const dueDate = currentTime + 86400; // 1 day from now
      
      const tx = await taskManager.addTask("High Priority Task", "This is urgent", Priority.High, dueDate);
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.events.find(e => e.event === 'TaskAdded');
      expect(event).to.not.be.undefined;
      expect(event.args.priority).to.equal(Priority.High);
      expect(event.args.dueDate).to.equal(dueDate);
      
      // Check task details
      const task = await taskManager.getTask(0);
      expect(task.title).to.equal("High Priority Task");
      expect(task.priority).to.equal(Priority.High);
      expect(task.dueDate).to.equal(dueDate);
    });

    it("Should allow editing a task with all parameters", async function () {
      // Create a task first
      await taskManager.addTask("Original Title", "Original Description");
      
      const newDueDate = (await time.latest()) + 172800; // 2 days from now
      
      // Edit the task with all parameters
      const tx = await taskManager.editTask(0, "Updated Title", "Updated Description", Priority.High, newDueDate);
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.events.find(e => e.event === 'TaskUpdated');
      expect(event).to.not.be.undefined;
      expect(event.args.newTitle).to.equal("Updated Title");
      expect(event.args.newDescription).to.equal("Updated Description");
      expect(event.args.priority).to.equal(Priority.High);
      expect(event.args.dueDate).to.equal(newDueDate);
      
      // Check updated task details
      const task = await taskManager.getTask(0);
      expect(task.title).to.equal("Updated Title");
      expect(task.description).to.equal("Updated Description");
      expect(task.priority).to.equal(Priority.High);
      expect(task.dueDate).to.equal(newDueDate);
    });

    it("Should allow editing a task with just title and description", async function () {
      // Create a task first with high priority
      const dueDate = (await time.latest()) + 86400;
      await taskManager.addTask("Original Title", "Original Description", Priority.High, dueDate);
      
      // Edit just the title and description
      await taskManager.editTask(0, "Updated Title", "Updated Description");
      
      // Check that priority and due date are preserved
      const task = await taskManager.getTask(0);
      expect(task.title).to.equal("Updated Title");
      expect(task.description).to.equal("Updated Description");
      expect(task.priority).to.equal(Priority.High);
      expect(task.dueDate).to.equal(dueDate);
    });

    it("Should allow marking a task as completed", async function () {
      // Create a task first
      await taskManager.addTask("Task to Complete", "This task will be completed");
      
      // Complete the task
      const tx = await taskManager.completeTask(0);
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.events.find(e => e.event === 'TaskCompleted');
      expect(event).to.not.be.undefined;
      expect(event.args.completed).to.equal(true);
      
      // Check task completion status
      const task = await taskManager.getTask(0);
      expect(task.completed).to.equal(true);
    });

    it("Should allow marking a completed task as uncompleted", async function () {
      // Create and complete a task
      await taskManager.addTask("Task to Uncomplete", "This task will be uncompleted");
      await taskManager.completeTask(0);
      
      // Uncomplete the task
      const tx = await taskManager.uncompleteTask(0);
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.events.find(e => e.event === 'TaskCompleted');
      expect(event).to.not.be.undefined;
      expect(event.args.completed).to.equal(false);
      
      // Check task completion status
      const task = await taskManager.getTask(0);
      expect(task.completed).to.equal(false);
    });

    it("Should allow deleting a task", async function () {
      // Create a task first
      await taskManager.addTask("Task to Delete", "This task will be deleted");
      
      // Delete the task
      const tx = await taskManager.deleteTask(0);
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.events.find(e => e.event === 'TaskDeleted');
      expect(event).to.not.be.undefined;
      
      // Check task count
      expect(await taskManager.getTaskCount()).to.equal(0);
    });

    it("Should fetch all tasks for a user", async function () {
      // Create multiple tasks
      await taskManager.addTask("Task 1", "Description 1");
      await taskManager.addTask("Task 2", "Description 2");
      await taskManager.addTask("Task 3", "Description 3");
      
      // Fetch all tasks
      const tasks = await taskManager.fetchAllTasks();
      
      // Check task count and details
      expect(tasks.length).to.equal(3);
      expect(tasks[0].title).to.equal("Task 1");
      expect(tasks[1].title).to.equal("Task 2");
      expect(tasks[2].title).to.equal("Task 3");
    });

    it("Should fetch tasks by completion status", async function () {
      // Create multiple tasks
      await taskManager.addTask("Task 1", "Description 1");
      await taskManager.addTask("Task 2", "Description 2");
      await taskManager.addTask("Task 3", "Description 3");
      
      // Complete some tasks
      await taskManager.completeTask(0);
      await taskManager.completeTask(2);
      
      // Fetch completed tasks
      const completedTasks = await taskManager.fetchTasksByStatus(true);
      expect(completedTasks.length).to.equal(2);
      expect(completedTasks[0].title).to.equal("Task 1");
      expect(completedTasks[1].title).to.equal("Task 3");
      
      // Fetch incomplete tasks
      const incompleteTasks = await taskManager.fetchTasksByStatus(false);
      expect(incompleteTasks.length).to.equal(1);
      expect(incompleteTasks[0].title).to.equal("Task 2");
    });

    it("Should fetch tasks by priority", async function () {
      // Create tasks with different priorities
      await taskManager.addTask("Low Priority", "Description", Priority.Low, 0);
      await taskManager.addTask("Medium Priority", "Description", Priority.Medium, 0);
      await taskManager.addTask("High Priority 1", "Description", Priority.High, 0);
      await taskManager.addTask("High Priority 2", "Description", Priority.High, 0);
      
      // Fetch high priority tasks
      const highPriorityTasks = await taskManager.fetchTasksByPriority(Priority.High);
      expect(highPriorityTasks.length).to.equal(2);
      expect(highPriorityTasks[0].title).to.equal("High Priority 1");
      expect(highPriorityTasks[1].title).to.equal("High Priority 2");
      
      // Fetch medium priority tasks
      const mediumPriorityTasks = await taskManager.fetchTasksByPriority(Priority.Medium);
      expect(mediumPriorityTasks.length).to.equal(1);
      expect(mediumPriorityTasks[0].title).to.equal("Medium Priority");
    });

    it("Should fetch tasks due soon", async function () {
      const currentTime = await time.latest();
      
      // Create tasks with different due dates
      await taskManager.addTask("Due Soon 1", "Description", Priority.High, currentTime + 3600); // 1 hour from now
      await taskManager.addTask("Due Soon 2", "Description", Priority.Medium, currentTime + 86000); // ~23.9 hours from now
      await taskManager.addTask("Not Due Soon", "Description", Priority.Low, currentTime + 172800); // 2 days from now
      await taskManager.addTask("No Due Date", "Description", Priority.Low, 0); // No due date
      
      // Complete one of the due soon tasks
      await taskManager.completeTask(0);
      
      // Fetch tasks due soon (should only include incomplete tasks due within 24 hours)
      const dueSoonTasks = await taskManager.fetchTasksDueSoon();
      expect(dueSoonTasks.length).to.equal(1);
      expect(dueSoonTasks[0].title).to.equal("Due Soon 2");
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-owners from editing tasks", async function () {
      // Owner creates a task
      await taskManager.addTask("Owner's Task", "Created by owner");
      
      // Another user tries to edit it
      await expect(
        taskManager.connect(addr1).editTask(0, "Hacked Title", "Hacked Description")
      ).to.be.revertedWith("Only the task owner can edit this task");
    });

    it("Should prevent non-owners from completing tasks", async function () {
      // Owner creates a task
      await taskManager.addTask("Owner's Task", "Created by owner");
      
      // Another user tries to complete it
      await expect(
        taskManager.connect(addr1).completeTask(0)
      ).to.be.revertedWith("Only the task owner can modify this task");
    });

    it("Should prevent non-owners from deleting tasks", async function () {
      // Owner creates a task
      await taskManager.addTask("Owner's Task", "Created by owner");
      
      // Another user tries to delete it
      await expect(
        taskManager.connect(addr1).deleteTask(0)
      ).to.be.revertedWith("Only the task owner can delete this task");
    });

    it("Should allow different users to manage their own tasks", async function () {
      // User 1 creates a task
      await taskManager.connect(addr1).addTask("User 1 Task", "Created by user 1");
      
      // User 2 creates a task
      await taskManager.connect(addr2).addTask("User 2 Task", "Created by user 2");
      
      // User 1 should be able to edit their own task
      await taskManager.connect(addr1).editTask(0, "Updated User 1 Task", "Updated by user 1");
      
      // User 2 should be able to edit their own task
      await taskManager.connect(addr2).editTask(1, "Updated User 2 Task", "Updated by user 2");
      
      // Check task details
      const task1 = await taskManager.getTask(0);
      const task2 = await taskManager.getTask(1);
      
      expect(task1.owner).to.equal(addr1.address);
      expect(task1.title).to.equal("Updated User 1 Task");
      
      expect(task2.owner).to.equal(addr2.address);
      expect(task2.title).to.equal("Updated User 2 Task");
    });
  });
}); 