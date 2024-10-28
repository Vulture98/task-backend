import User from "../models/userModels.js";
import asyncHandler from "./asyncHandler.js";
import jwt from "jsonwebtoken";

const authenticate = asyncHandler(async (req, res, next) => {
  console.log(`here in authenticate() `);
  let token;
  token = req.cookies.jwt;

  console.log(`"authenticate-token":`, token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);      
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      console.error(`"error.message":`, error.message);
      console.log(`"error.message":`, error.message);
      return res.status(401).json({ message: "Not authorized" });
    }
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }
});

const authorizeAdmin = (req, res, next) => {
  // console.log(`"req.user":`, req.user);
  // console.log(`"req.user.isAdmin":`, req.user.isAdmin);
  if (req.user && req.user.isAdmin) {
    console.log("User is admin");
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Unauthorized to access this resource" });
  }
  // setInterval(() => {
  //   next()
  // }, 1);
  // next();		throws err? sends multiple req by d time next middle sends req
};

export { authorizeAdmin, authenticate };