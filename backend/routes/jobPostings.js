const express = require("express");
const passport = require("passport");
const router = express.Router();
const JobPosting = require("../models/JobPosting");
const ProfilePicture = require("../models/ProfilePicture"); // Import ProfilePicture model
const multer = require('multer'); // Import multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new job posting
router.post("/create", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        // 1. Identify the user who is calling it
        const user = req.user;

        // 2. Fetch user's profile picture from ProfilePicture model using the user ID
        const profilePic = await ProfilePicture.findOne({ userId: user._id });
        const userPic = profilePic ? profilePic.image : null;

        // 3. Create the job posting object
        const { companyName, email, jobTitle, jobFunction, jobLocation, seniorityLevel, description, employmentType, industryType, experience } = req.body;

        // Check if required fields are provided
        if (!companyName || !email || !jobTitle || !jobLocation || !description) {
            return res.status(400).json({ error: "Required fields are missing!" });
        }

        // Create the job posting object
        const jobPosting = new JobPosting({
            postedBy: user._id, // Assuming postedBy is the user's ID
            userName: user.name, // Add user's name
            userPic,
            companyName,
            email,
            jobTitle,
            jobFunction,
            jobLocation,
            description,
            seniorityLevel,
            employmentType,
            industryType,
            experience,
            postingDate: Date.now(),
        });

        // 4. Save the job posting
        await jobPosting.save();

        // 5. Return a response
        return res.status(201).json(jobPosting);
    } catch (error) {
        console.error("Error creating job posting:", error);
        return res.status(400).json({ error: "Failed to create job posting!" });
    }
});

// Get all job postings
router.get("/getAll", async (req, res) => {
    try {
        const jobs = await JobPosting.find().populate('postedBy', 'name profilePic'); // Populate the postedBy field with user details
        res.send(jobs);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a single job posting by ID
router.get("/:id", async (req, res) => {
    try {
        const jobPosting = await JobPosting.findById(req.params.id);
        if (!jobPosting) {
            return res.status(404).send();
        }
        res.send(jobPosting);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a job posting by ID
router.patch("/:id", async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        "companyName",
        "email",
        "jobTitle",
        "jobFunction",
        "jobLocation",
        "numberofApplicants",
        "seniorityLevel",
        "description",
        "postingDate",
        "employmentType",
        "industryType",
        "experience",
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const jobPosting = await JobPosting.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!jobPosting) {
            return res.status(404).send();
        }

        res.send(jobPosting);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a job posting by ID
router.delete("/:id", async (req, res) => {
    try {
        const jobPosting = await JobPosting.findByIdAndDelete(req.params.id);

        if (!jobPosting) {
            return res.status(404).send();
        }

        res.send(jobPosting);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
