import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import session from "express-session";
import connectDB from "./config/db.js";
import cors from "cors";
import generateToken from "./utils/createToken.js";
import router from "./routes/userRoutes.js";
import routerTask from "./routes/taskRoutes.js";
import routerGoogle from "./routes/googleRoutes.js";
import { OAuth2Client } from "google-auth-library";
import User from './models/userModels.js'

dotenv.config();
const PORT = 5000;
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "https://map-frontend-d6yw.vercel.app",
  "https://map-frontend-p78x.vercel.app/",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Set up session
// app.use(
//   session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//   })
// );

/*
app.use(passport.initialize());
// app.use(passport.session());

// Configure Google Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(`here in passport.GoogleStrategy() `);
      try {
        console.log(`"passport() profile":`, profile);
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          console.log(`passport() existing User `);
          return done(null, existingUser);
        }
        console.log(`passport() new User `);

        const newUser = await new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          password: "checking",
        }).save();
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

// Define Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }), // No session management
  (req, res) => {
    console.log(`Hello callback, User:`, req.user); // Access authenticated user data

    // Check if user is authenticated
    if (!req.user) {
      console.log("User not found");
      return res.redirect("/api/users/auth"); // Redirect if user not found
    }

    console.log(
      "Request User ID:",
      req.user ? req.user._id : "No user authenticated"
    );

    // Generate token and set it as a cookie
    const token = generateToken(res, req.user._id); // Pass res and user ID to generateToken
    console.log(`Token generated:`, token);

    // Redirect to user profile after setting the cookie
    // return res.redirect("/api/users/profile"); // Make sure to return here
    // return res.redirect("/user/task"); // Make sure to return here
    // return res.status(201).json({ message: `welcome ${req.user.username}` });
    // return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);
*/

app.use("/api/users", router);
app.use("/user/task", routerTask);
// app.use("auth/google", routerGoogle)

const CLIENT_ID =
  "996854244066-qhu97d9626ig6akind1igmvd7bp1s4su.apps.googleusercontent.com"; // Replace with your actual Google Client ID
const client = new OAuth2Client(CLIENT_ID);

/*
// WORKING
app.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload["sub"]; // User's Google ID

    // Handle user creation or login here

    res.status(200).json({
      success: true,
      message: "User authenticated",      
      userId,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});
*/

app.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const googleId = payload['sub'];
      const username = payload['name'];
      const email = payload['email'];

      // Check for existing user
      let user = await User.findOne({ googleId });
      console.log(`Hello from post /auth/google `);
      if (!user) {
          // Create a new user if not found
          user = await User.create({ googleId, username, email, password:'checking', isGoogle:true });
          console.log(`New User created - email: ${user.email} username: ${user.username}`);

          console.log('Response Headers:', res.getHeaders());
          console.log('Cookies:', res.getHeader('Set-Cookie'));

          const jwtToken = generateToken(res, user._id)
          return res.status(200).json({ success: true, userId: user.googleId, name: user.username, email: user.email, message: "User Created" });
      }

      const jwtToken = generateToken(res, user._id)
      console.log('Response Headers:', res.getHeaders());
      console.log('Cookies:', res.getHeader('Set-Cookie'));
      console.log(`Existing User email: ${user.email} username: ${user.username}`);
      res.status(200).json({ success: true, userId: user.googleId, name: user.username, email: user.email, message: "Existing User" });
  } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

/*
router.get("/api/users/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user,
    });
  } else {
    res.status(401).json({
      isAuthenticated: false,
    });
  }
});
*/

app.get("/", (req, res) => {
  return res.status(201).json({ message: "Hello from G-AUTH-2" });
});
app.listen(PORT, () => {
  console.log(`server start at port no ${PORT}`);
});
