import express from "express";
import Task from "../models/taskModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModels.js";
import formattedTasks from "../utils/formattedTasks.js";
import deletedTask from "../temp/delete.js";

/*
const createTask = asyncHandler(async (req, res) => {
  console.log(`createTask() `);
  try {
    // console.log(`"req":`, req);
    const { title, description, status, userId } = req.body; // Remove user from here
    const user = req.user._id; // Assuming you are attaching the user ID to the request in a middleware
    const newTask = await Task.create({
      title,
      description,
      user,
      status,
      userId,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: "Error creating task", error });
    console.error(`"error.message":`, error.message);
  }
});
*/

const createTask = asyncHandler(async (req, res) => {
  console.log(`createTask()`);
  console.log(`"req.user.username":`, req.user.username);
  try {
    const { title, description, status, index } = req.body; // Removed userId from here
    const user = req.user._id; // Assuming you are attaching the user ID to the request in a middleware

    // Create a new task
    const newTask = await Task.create({
      title,
      description,
      userId: user, // Save the user ID to userId field in the task
      status,
      index,
    });

    // Respond with the created task
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: "Error creating task", error });
    console.error(`"error.message":`, error.message);
  }
});

// Get all tasks
/*
const getAllTasks = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "username"); // Populate user data
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});
*/
const getAllTasks = asyncHandler(async (req, res) => {
  console.log(`in getAllTasks()  ===  ===  ===  ===  ===  ===  ===`);
  console.log(`"req.user.username":`, req.user.username);
  try {
    //if googleUser
    if (req.user.googleId === true) {
      console.log(`"req.user.googleId":`, req.user.googleId);
      // Find the user with the googleId and get their userId
      const user = await User.findOne({ googleId: req.user.googleId });
      console.log(`"user.username":`, user.username);
    }

    const tasks = await Task.find({ userId: req.user.id }); // Fetch tasks only for the logged-in user
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

const deleteTask0 = asyncHandler(async (req, res) => {
  console.log(`here in deleteTask() `);
  console.log(`task id to be deleted: ${req.params.id} `);
  console.log(`task name to be deleted: ${req.params.title} `);
  const { id } = req.params; // Extract task ID from URL parameters

  try {
    const task = await Task.findByIdAndDelete(id); // Find and delete the task

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
});

const deleteTask = asyncHandler(async (req, res) => {
  // deletedTask(req, res);
  console.log(`here in deletedTask() `);
  const { id } = req.params; // Extract task ID from URL parameters

  try {
    const task = await Task.findById(id);
    const index = task.index;
    const userId = task.userId; // Get the user ID from the task

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const taskDeleted = await Task.findByIdAndDelete(id);
    if (!taskDeleted) {
      return res.status(404).json({ message: "Task cant be deleted" });
    }
    await Task.updateMany(
      { userId: userId, index: { $gt: index } },
      { $inc: { index: -1 } } // Decrement the index for tasks after the deleted one
    );
    const updatedTasks = await Task.find({ userId: userId });
    console.log(`"user-all tasks after":`, formattedTasks(updatedTasks));

    res
      .status(200)
      // .json({ message: "Task deleted successfully", tasks: updatedTasks });
      .json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body; // Destructure all fields from the request body

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, status }, // Update all three fields
      { new: true, runValidators: true } // Use runValidators to ensure validation rules are followed
    );

    if (!updatedTask) {
      return res.status(404).send({ message: "Task not found" });
    }

    res.send(updatedTask); // Return the updated task
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

const updateIndex = asyncHandler(async (req, res) => {
  console.log(`inside updateIndex()`);
  console.log(`"req.body":`, req.body);
  const { id } = req.params; // Task ID
  const { newIndex, newStatus } = req.body; // New index and target column
  console.log(
    `Updating task ${id} to index ${newIndex} in column ${newStatus}`
  );

  // 1. Find the task being moved
  const task = await Task.findById(id);
  const findUserId = task.userId;
  const tasks = await Task.find({ userId: findUserId }); // Fetch tasks only for the logged-in user

  console.log(`"task":`, task.title);
  console.log(
    `"task:${task.title}" & "user-all tasks before":`,
    formattedTasks(tasks)
  ); // Now logs only the selected fields

  if (!task) {
    console.log(`Task not found `);
    return res.status(404).json({ message: "Task not found." });
  }

  const sourceStatus = task.status;
  const oldIndex = task.index;

  // 2. Update the task's new column and index if the column is different
  if (sourceStatus !== newStatus) {
    console.log(`inside sourceStatus !== status `);
    await Task.updateMany(
      { status: newStatus, index: { $gte: newIndex } },
      { $inc: { index: 1 } } // Increment the index for tasks in target column
    );
    await Task.updateMany(
      { status: sourceStatus, index: { $gt: oldIndex } },
      { $inc: { index: -1 } } // Increment the index for tasks in src column
    );
    await Task.updateOne({ _id: id }, { status: newStatus, index: newIndex });
  } else {
    if (oldIndex > newIndex) {
      console.log(`sourceStatus == newStatus MOVING UP if ===  ===  ===  === `);
      await Task.updateMany(
        { status: newStatus, index: { $gte: newIndex, $lt: oldIndex } },
        { $inc: { index: 1 } } // Increment the index for tasks in the target column
      );
      await Task.updateOne({ _id: id }, { status: newStatus, index: newIndex });
    } else {
      //new > old
      console.log(`sourceStatus == newStatus else MOVING DOWN else  ===  ===`);
      await Task.updateMany(
        { status: newStatus, index: { $gt: oldIndex, $lte: newIndex } },
        { $inc: { index: -1 } } // Increment the index for tasks in the target column
      );
      await Task.updateOne({ _id: id }, { status: newStatus, index: newIndex });
    }
  }

  // after index reorder
  const tasksOrder = await Task.find({ userId: findUserId }); // Fetch tasks only for the logged-in user
  console.log(`"user-all tasks after":`, formattedTasks(tasksOrder));

  // 3. Fetch tasks in all three columns for this specific user
  const userId = task.userId; // Assuming each task has a userId field
  const columns = ["to-do", "in-progress", "done"];
  const allColumnsTasks = {};

  for (const col of columns) {
    const tasksInColumn = await Task.find({ column: col, userId })
      .sort({ index: 1 })
      .select("name description index"); // Fetching only necessary fields

    allColumnsTasks[col] = tasksInColumn;
  }

  // Logging each column's tasks for verification
  console.log("Updated tasks in all columns for this user:");
  // for (const col of columns) {
  //   const tasksInColumn = await Task.find({ column: col, userId })
  //     .sort({ index: 1 })
  //     .select("name description index");

  //   // Check if any tasks were fetched for the column
  //   console.log(`Tasks fetched for column "${col}":`, tasksInColumn);

  //   allColumnsTasks[col] = tasksInColumn;
  // }

  // Sending response with the updated tasks in each column

  // res.status(200).json({
  //   message: "Task index updated successfully!",
  // });

  // sending updated tasks
  const updatedTasks = await Task.find({ userId: req.user.id }); // Fetch tasks only for the logged-in user
  res.json(updatedTasks);
  console.log(`end of updateIndex()`);
});

export { getAllTasks, createTask, deleteTask, updateTask, updateIndex };
