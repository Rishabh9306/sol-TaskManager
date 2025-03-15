// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TaskManager
 * @dev A blockchain-based task manager that allows users to create, edit, complete, and delete tasks
 */
contract TaskManager is Ownable {
    // Counter for generating unique task IDs
    uint256 private _taskIdCounter;
    
    // Priority levels for tasks
    enum Priority { Low, Medium, High }
    
    // Task struct definition with enhanced features
    struct Task {
        uint256 id;
        string title;
        string description;
        bool completed;
        address owner;
        Priority priority;
        uint256 dueDate; // Unix timestamp for due date (0 means no due date)
        uint256 createdAt;
    }
    
    // Mapping from taskId to Task
    mapping(uint256 => Task) private _tasks;
    
    // Mapping from user address to their task IDs
    mapping(address => uint256[]) private _userTasks;
    
    // Admin settings
    bool private _paused;
    uint256 private _maxTasksPerUser;
    
    // Events
    event TaskAdded(uint256 taskId, address owner, string title, Priority priority, uint256 dueDate);
    event TaskUpdated(uint256 taskId, string newTitle, string newDescription, Priority priority, uint256 dueDate);
    event TaskCompleted(uint256 taskId, bool completed);
    event TaskDeleted(uint256 taskId);
    event ContractPaused(bool paused);
    event MaxTasksPerUserChanged(uint256 maxTasks);
    
    /**
     * @dev Constructor to initialize the contract with default values
     */
    constructor() {
        _paused = false;
        _maxTasksPerUser = 100; // Default max tasks per user
    }
    
    /**
     * @dev Modifier to check if the contract is not paused
     */
    modifier whenNotPaused() {
        require(!_paused, "Contract is paused");
        _;
    }
    
    /**
     * @dev Pause or unpause the contract (admin only)
     * @param paused The new paused state
     */
    function setPaused(bool paused) external onlyOwner {
        if (_paused != paused) {
            _paused = paused;
            emit ContractPaused(paused);
        }
    }
    
    /**
     * @dev Set the maximum number of tasks per user (admin only)
     * @param maxTasks The maximum number of tasks a user can create
     */
    function setMaxTasksPerUser(uint256 maxTasks) external onlyOwner {
        if (_maxTasksPerUser != maxTasks) {
            _maxTasksPerUser = maxTasks;
            emit MaxTasksPerUserChanged(maxTasks);
        }
    }
    
    /**
     * @dev Get the current maximum tasks per user
     * @return uint256 The maximum number of tasks per user
     */
    function getMaxTasksPerUser() external view returns (uint256) {
        return _maxTasksPerUser;
    }
    
    /**
     * @dev Check if the contract is paused
     * @return bool The paused state
     */
    function isPaused() external view returns (bool) {
        return _paused;
    }
    
    /**
     * @dev Add a new task with priority and due date
     * @param title The title of the task
     * @param description The description of the task
     * @param priority The priority level of the task (0=Low, 1=Medium, 2=High)
     * @param dueDate Unix timestamp for the due date (0 means no due date)
     * @return taskId The ID of the newly created task
     */
    function addTask(
        string calldata title, 
        string calldata description, 
        uint8 priority, 
        uint256 dueDate
    ) external whenNotPaused returns (uint256) {
        require(priority <= uint8(Priority.High), "Invalid priority level");
        require(_userTasks[msg.sender].length < _maxTasksPerUser, "Maximum number of tasks reached");
        
        uint256 taskId = _taskIdCounter;
        _taskIdCounter++;
        
        _tasks[taskId] = Task({
            id: taskId,
            title: title,
            description: description,
            completed: false,
            owner: msg.sender,
            priority: Priority(priority),
            dueDate: dueDate,
            createdAt: block.timestamp
        });
        
        _userTasks[msg.sender].push(taskId);
        
        emit TaskAdded(taskId, msg.sender, title, Priority(priority), dueDate);
        
        return taskId;
    }
    
    /**
     * @dev Add a new task with default priority and no due date
     * @param title The title of the task
     * @param description The description of the task
     * @return taskId The ID of the newly created task
     */
    function addTask(string calldata title, string calldata description) external whenNotPaused returns (uint256) {
        return addTask(title, description, uint8(Priority.Medium), 0);
    }
    
    /**
     * @dev Edit an existing task
     * @param taskId The ID of the task to edit
     * @param newTitle The new title for the task
     * @param newDescription The new description for the task
     * @param priority The new priority level
     * @param dueDate The new due date
     */
    function editTask(
        uint256 taskId, 
        string calldata newTitle, 
        string calldata newDescription,
        uint8 priority,
        uint256 dueDate
    ) external whenNotPaused {
        Task storage task = _tasks[taskId];
        require(task.owner == msg.sender, "Only the task owner can edit this task");
        require(priority <= uint8(Priority.High), "Invalid priority level");
        
        task.title = newTitle;
        task.description = newDescription;
        task.priority = Priority(priority);
        task.dueDate = dueDate;
        
        emit TaskUpdated(taskId, newTitle, newDescription, Priority(priority), dueDate);
    }
    
    /**
     * @dev Edit an existing task with just title and description
     * @param taskId The ID of the task to edit
     * @param newTitle The new title for the task
     * @param newDescription The new description for the task
     */
    function editTask(uint256 taskId, string calldata newTitle, string calldata newDescription) external whenNotPaused {
        Task storage task = _tasks[taskId];
        require(task.owner == msg.sender, "Only the task owner can edit this task");
        
        task.title = newTitle;
        task.description = newDescription;
        
        emit TaskUpdated(taskId, newTitle, newDescription, task.priority, task.dueDate);
    }
    
    /**
     * @dev Mark a task as completed or not completed
     * @param taskId The ID of the task to mark as completed
     * @param status The completion status to set
     */
    function setTaskCompletion(uint256 taskId, bool status) external whenNotPaused {
        Task storage task = _tasks[taskId];
        require(task.owner == msg.sender, "Only the task owner can modify this task");
        
        if (task.completed != status) {
            task.completed = status;
            emit TaskCompleted(taskId, status);
        }
    }
    
    /**
     * @dev Mark a task as completed
     * @param taskId The ID of the task to mark as completed
     */
    function completeTask(uint256 taskId) external whenNotPaused {
        setTaskCompletion(taskId, true);
    }
    
    /**
     * @dev Mark a task as not completed
     * @param taskId The ID of the task to mark as not completed
     */
    function uncompleteTask(uint256 taskId) external whenNotPaused {
        setTaskCompletion(taskId, false);
    }
    
    /**
     * @dev Delete a task
     * @param taskId The ID of the task to delete
     */
    function deleteTask(uint256 taskId) external whenNotPaused {
        Task memory task = _tasks[taskId];
        require(task.owner == msg.sender, "Only the task owner can delete this task");
        
        // Remove the task from the user's task list
        uint256[] storage userTaskIds = _userTasks[msg.sender];
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            if (userTaskIds[i] == taskId) {
                // Replace the element to delete with the last element
                userTaskIds[i] = userTaskIds[userTaskIds.length - 1];
                // Remove the last element
                userTaskIds.pop();
                break;
            }
        }
        
        // Delete the task from the tasks mapping
        delete _tasks[taskId];
        
        emit TaskDeleted(taskId);
    }
    
    /**
     * @dev Admin function to delete any task (emergency use only)
     * @param taskId The ID of the task to delete
     */
    function adminDeleteTask(uint256 taskId) external onlyOwner {
        Task memory task = _tasks[taskId];
        address taskOwner = task.owner;
        
        // Remove the task from the user's task list
        uint256[] storage userTaskIds = _userTasks[taskOwner];
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            if (userTaskIds[i] == taskId) {
                // Replace the element to delete with the last element
                userTaskIds[i] = userTaskIds[userTaskIds.length - 1];
                // Remove the last element
                userTaskIds.pop();
                break;
            }
        }
        
        // Delete the task from the tasks mapping
        delete _tasks[taskId];
        
        emit TaskDeleted(taskId);
    }
    
    /**
     * @dev Get a specific task
     * @param taskId The ID of the task to retrieve
     * @return Task The task data
     */
    function getTask(uint256 taskId) external view returns (Task memory) {
        return _tasks[taskId];
    }
    
    /**
     * @dev Get all tasks owned by the caller
     * @return Task[] An array of tasks owned by the caller
     */
    function fetchAllTasks() external view returns (Task[] memory) {
        uint256[] memory userTaskIds = _userTasks[msg.sender];
        Task[] memory userTasksArray = new Task[](userTaskIds.length);
        
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            userTasksArray[i] = _tasks[userTaskIds[i]];
        }
        
        return userTasksArray;
    }
    
    /**
     * @dev Get tasks filtered by completion status
     * @param completed Whether to fetch completed or incomplete tasks
     * @return Task[] An array of tasks with the specified completion status
     */
    function fetchTasksByStatus(bool completed) external view returns (Task[] memory) {
        uint256[] memory userTaskIds = _userTasks[msg.sender];
        
        // Count tasks with the specified completion status
        uint256 count = 0;
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            if (_tasks[userTaskIds[i]].completed == completed) {
                count++;
            }
        }
        
        // Create array of the right size
        Task[] memory filteredTasks = new Task[](count);
        
        // Fill the array
        uint256 index = 0;
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            if (_tasks[userTaskIds[i]].completed == completed) {
                filteredTasks[index] = _tasks[userTaskIds[i]];
                index++;
            }
        }
        
        return filteredTasks;
    }
    
    /**
     * @dev Get tasks with a specific priority level
     * @param priority The priority level to filter by
     * @return Task[] An array of tasks with the specified priority
     */
    function fetchTasksByPriority(uint8 priority) external view returns (Task[] memory) {
        require(priority <= uint8(Priority.High), "Invalid priority level");
        
        uint256[] memory userTaskIds = _userTasks[msg.sender];
        
        // Count tasks with the specified priority
        uint256 count = 0;
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            if (uint8(_tasks[userTaskIds[i]].priority) == priority) {
                count++;
            }
        }
        
        // Create array of the right size
        Task[] memory filteredTasks = new Task[](count);
        
        // Fill the array
        uint256 index = 0;
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            if (uint8(_tasks[userTaskIds[i]].priority) == priority) {
                filteredTasks[index] = _tasks[userTaskIds[i]];
                index++;
            }
        }
        
        return filteredTasks;
    }
    
    /**
     * @dev Get tasks that are due soon (within the next 24 hours)
     * @return Task[] An array of tasks due within 24 hours
     */
    function fetchTasksDueSoon() external view returns (Task[] memory) {
        uint256[] memory userTaskIds = _userTasks[msg.sender];
        uint256 tomorrow = block.timestamp + 1 days;
        
        // Count tasks due soon
        uint256 count = 0;
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            Task memory task = _tasks[userTaskIds[i]];
            if (task.dueDate > 0 && task.dueDate <= tomorrow && !task.completed) {
                count++;
            }
        }
        
        // Create array of the right size
        Task[] memory dueSoonTasks = new Task[](count);
        
        // Fill the array
        uint256 index = 0;
        for (uint256 i = 0; i < userTaskIds.length; i++) {
            Task memory task = _tasks[userTaskIds[i]];
            if (task.dueDate > 0 && task.dueDate <= tomorrow && !task.completed) {
                dueSoonTasks[index] = task;
                index++;
            }
        }
        
        return dueSoonTasks;
    }
    
    /**
     * @dev Get the total number of tasks created by the caller
     * @return uint256 The number of tasks
     */
    function getTaskCount() external view returns (uint256) {
        return _userTasks[msg.sender].length;
    }
    
    /**
     * @dev Admin function to get the total number of tasks in the system
     * @return uint256 The total number of tasks
     */
    function getTotalTaskCount() external view onlyOwner returns (uint256) {
        return _taskIdCounter;
    }
} 