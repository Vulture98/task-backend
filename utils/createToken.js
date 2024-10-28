import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  console.log(`inside generateToken() `);
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  //set jwt http cookie
  res.cookie("jwt", token, {
    // expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    // sameSite: "strict",
    sameSite: "Lax",
    // sameSite: "None",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export default generateToken;
