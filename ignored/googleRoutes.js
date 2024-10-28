import express from "express";
import {
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUser,
  loginUser,
  logoutCurrentUser,
  createUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  updateUserById,
} from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const routerGoogle = express.Router();




// routerGoogle.post('/', createUser)
// admin stuff
routerGoogle
  .route("/")
  .post(createUser)
  .get(authenticate, authorizeAdmin, getAllUsers);
// this is confused with /profile
// routerGoogle.route("/:id").get(getUserById).delete(deleteUser).put(updateUser);
routerGoogle.post("/auth", loginUser);
routerGoogle.post("/logout", logoutCurrentUser);

// user stuff
routerGoogle
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile);

// admin routes
routerGoogle
  .route("/:id")
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, authorizeAdmin, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById);

export default routerGoogle;
