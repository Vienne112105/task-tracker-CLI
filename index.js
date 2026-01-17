#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the JSON file
const task_File = path.join(__dirname, "tasks.json");

// JSON file must exist before reading from it
function dataFile() {
    if (!fs.existsSync(task_File)) {
        fs.writeFileSync(task_File, JSON.stringify([], null, 2));
    }
}

// Load existing Tasks
function loadTasks() {
    dataFile();
    const data = fs.readFileSync(task_File, 'utf-8');
    return JSON.parse(data);
}

// Save Tasks to the JSON file
function saveTasks(tasks) {
    fs.writeFileSync(task_File, JSON.stringify(tasks, null, 2));
}

function addTask(description) {
    if (!description) {
        console.error("Task description cannot be empty.");
        return;
    }

    const tasks = loadTasks();
    // generates a new ID based on the last task's ID
    const id = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
    // create timestamp based on current time and date
    const now = new Date().toISOString();

    const task = {
        id,
        description,
        status: "todo",
        createdAt: now,
        updatedAt: now
    };

    tasks.push(task);
    saveTasks(tasks);

    console.log(`Task added: "${description}"`);
}

// Update existing task
function updateTask(id, newDescription) {
    const tasks = loadTasks();
    // find task by ID, Number() converts string to number
    const taskID = tasks.find(task_id => task_id.id === Number(id));

    // if task not found, return error message
    if (!taskID) {
        console.error("Task not found!");
        return;
    }

    // update task description and timestamp
    taskID.description = newDescription;
    taskID.updatedAt = new Date().toISOString();
    saveTasks(tasks);

    console.log("task Updated successfully.");

}

// Delete a task by ID
function deleteTask(id) {
    const tasks = loadTasks();
    // filter out the task to be deleted by id
    const filteredTasks = tasks.filter(task_id => task_id.id !== Number(id));

    // check if any task was removed
    if (filteredTasks.length === tasks.length) {
        console.error("Task not found!");
        return;
    }

    saveTasks(filteredTasks);
    console.log("Task deleted successfully.");
}

// Mark task as done or todo
function markStatus(id, status) {
    const tasks = loadTasks();
    const taskID = tasks.find(task_id => task_id.id === Number(id));

    // if task id not found, return error message
    if (!taskID) {
        console.error("Task not found!");
        return;
    }

    // update task status and timestamp
    taskID.status = status;
    taskID.updatedAt = new Date().toISOString();
    saveTasks(tasks);

    console.log(`Task marked as ${status}.`);
}

// List all tasks, optionally filtered by status
function listTasks(filter) {
    const tasks = loadTasks();

    // filter tasks based on status if filter is provided
    const filtered = filter
        ? tasks.filter(task => task.status === filter)
        : tasks;

    if (!filtered.length) {
        console.log("No tasks found.");
        return;
    }

    // display tasks
    filtered.forEach(task => {
        console.log(`${task.id}. [${task.status}] ${task.description}`);
    });
}

// const command = args[0];
// const params = args.slice(1);    
// Destructuring Assignment ( does exactly the same as above two lines but better)
// vvvvvvvvvvvvvvvvvvvvvvvv
const args = process.argv.slice(2);
const [command, ...params] = args;

// command => executable, params => arguments passed
switch (command) {
  case "add":
    addTask(params.join(" "));
    break;
  case "update":
    updateTask(params[0], params.slice(1).join(" "));
    break;
  case "delete":
    deleteTask(params[0]);
    break;
  case "mark-in-progress":
    markStatus(params[0], "in-progress");
    break;
  case "mark-done":
    markStatus(params[0], "done");
    break;
  case "list":
    listTasks(params[0]);
    break;
  default:
    console.log("Unknown command.");
}
