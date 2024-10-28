import express from "express";
import {getAllTasks, createTask, deleteTask, updateTask} from '../controllers/taskController.js'
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const routerTask = express.Router();

// admin stuff
routerTask
  .route("/")  
  .get(authenticate, getAllTasks)

routerTask.route('/:id').get(authenticate, getAllTasks)

// user stuff
// routerTask
//   .route("/profile")  

// admin routes
// routerTask
//   .route("/:id")  

export default routerTask;
