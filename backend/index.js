const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const pino = require("pino")();
const expressPino = require("express-pino-logger");
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const cors = require("cors");
const cookieParser = require('cookie-parser'); // Added

// Load environment variables
require("dotenv").config();

const authRoutes = require("./routes/authentication");  // Import authentication routes
const experienceRoutes = require("./routes/experience"); // Import experience routes
const skillRoutes = require("./routes/skill");  // Import skill routes
const projectRoutes = require("./routes/project"); // Import project routes
const postRoutes = require("./routes/post");  // Import project routes
const connectionRoutes = require("./routes/connection"); // Import project routes
const profilePicRoutes = require("./routes/profilePicture"); // Import project routes
const jobPostingRoutes = require("./routes/jobPostings"); // Import project routes
const backgroundBannerRoutes = require("./routes/backgroundBanner"); // Import project routes


const User = require("./models/User"); // Import User model
const BackgroundBanner = require("./models/BackgroundBanner");  // Import BackgroundBanner model
const ProfilePicture = require("./models/ProfilePicture");  // Import ProfilePicture model


// Create an instance of Express
const app = express();

// Enable JSON parsing for incoming requests
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3001',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser()); // Added
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PuConnect', {
    useNewUrlParser: true,
  })
  .then(async () => {
    try {
      const defaultProfilePic = new ProfilePicture({
        userId: user._id,
        image: '/backend/image/defaultProfile.png',
        isDefault: true,
      });

      const defaultBanner = new BackgroundBanner({
        userId: user._id,
        bg_image: '/backend/image/defaultBanner.jpg',
        isDefault: true,
      });
     
      await defaultBanner.save();
      await defaultProfilePic.save();
      pino.info('Default Banner saved successfully');
    } catch (error) {
      pino.error('Error saving default Banner');
      pino.error(error);
    } 
   
    pino.info("Connected to MongoDB");

  })
  .catch((err) => {
    pino.error("Error occurred while connecting to MongoDB");
    pino.error(err);
  });

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "herecomesthesecretkey",
};

passport.use(
  new JwtStrategy(jwtOptions, async function (jwt_payload, done) {
    try {
      const user = await User.findOne({ _id: jwt_payload.identifier });

      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, false);
    }
  })
);

const logger = expressPino({ logger: pino });
app.use(logger);

app.use("/auth", authRoutes);
app.use("/experience", experienceRoutes);
app.use("/skill", skillRoutes);
app.use("/project", projectRoutes);
app.use("/post", postRoutes)
app.use("/connection", connectionRoutes);
app.use("/profile-picture", profilePicRoutes)
app.use("/job", jobPostingRoutes)
app.use("/bg-banner", backgroundBannerRoutes)


// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  pino.info(`Server is running on port ${port}`);
});
