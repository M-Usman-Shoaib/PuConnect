const mongoose = require("mongoose");

const JobPostingSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
    },
    userPic: {
        type: String,
    },
    companyName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    jobTitle: {
        type: String,
        required: true,
    },
    jobFunction: {
        type: String,
    },
    jobLocation: {
        type: String,
        required: true,
    },
    numberofApplicants: {
        type: Number,
        default: 0,
    },
    seniorityLevel: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    postingDate: {
        type: Date,
        default: Date.now,
    },
    employmentType: {
        type: String,
    },
    industryType: {
        type: String,
    },
    experience: {
        type: String,
    },
}, { timestamps: true });

const JobPosting = mongoose.model("JobPosting", JobPostingSchema);

module.exports = JobPosting;
