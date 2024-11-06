import express from "express";
import Task from "../models/taskModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModels.js";
import formattedTasks from "../utils/formattedTasks.js";

const deletedTask = async (req, res) => {
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
};

export default deletedTask;
