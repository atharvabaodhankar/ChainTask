// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract ToDoList {
    uint public taskCounter = 0;

    struct Task {
        uint id;
        string content;
        bool completed;
        uint createdAt;
    }

    // Mapping from user address to their tasks
    mapping(address => Task[]) private userTasks;

    event TaskCreated(address indexed user, uint taskId, string content);
    event TaskToggled(address indexed user, uint taskId, bool completed);
    event TaskDeleted(address indexed user, uint taskId);

    // Add a new task
    function addTask(string calldata _content) external {
        Task memory newTask = Task({
            id: taskCounter,
            content: _content,
            completed: false,
            createdAt: block.timestamp
        });

        userTasks[msg.sender].push(newTask);
        emit TaskCreated(msg.sender, taskCounter, _content);

        taskCounter++;
    }

    // Get all tasks for the sender
    function getMyTasks() external view returns (Task[] memory) {
        return userTasks[msg.sender];
    }

    // Toggle task completion
    function toggleTask(uint _taskId) external {
        Task[] storage tasks = userTasks[msg.sender];

        for (uint i = 0; i < tasks.length; i++) {
            if (tasks[i].id == _taskId) {
                tasks[i].completed = !tasks[i].completed;
                emit TaskToggled(msg.sender, _taskId, tasks[i].completed);
                return;
            }
        }

        revert("Task not found");
    }

    // Delete task by id
    function deleteTask(uint _taskId) external {
        Task[] storage tasks = userTasks[msg.sender];

        for (uint i = 0; i < tasks.length; i++) {
            if (tasks[i].id == _taskId) {
                tasks[i] = tasks[tasks.length - 1]; // Replace with last task
                tasks.pop(); // Remove last task
                emit TaskDeleted(msg.sender, _taskId);
                return;
            }
        }

        revert("Task not found");
    }
}
