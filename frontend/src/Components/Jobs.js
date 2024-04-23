import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../CSS/Posts.css"; // Import CSS file for styling

const Jobs = () => {
    const token = useSelector((state) => state.auth.token);
    const [allJobs, setAllJobs] = useState([]); // Changed variable name from "allPosts" to "allJobs"

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetch all job postings
                const response = await axios.get("http://localhost:3000/job/getAll", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Set the job postings to the state
                setAllJobs(response.data);
            } catch (error) {
                console.log("Error fetching job postings", error);
            }
        };

        fetchJobs();
    }, [token]); // Make sure to include token in the dependency array

    return (
        <div className="posts-container">
            {allJobs.map((job) => (
                <div key={job._id} className="post">
                
                <div className="user-info">
                    
                    {job.userPic && (
                        <img
                            src={`data:image/jpeg;base64,${job.userPic}`} // Prefix the base64-encoded string with appropriate data URI scheme
                            alt="User"
                            className="user-photo" // Add the class name for styling if needed
                        />
                    )}

                        <strong className="user-name">{job.userName}</strong>
                    </div>
                    <div className="post-description">
                        <h3>{job.jobTitle}</h3>
                        <p>{job.description}</p>
                        <p>Company: {job.companyName}</p>
                        <p>Email: {job.email}</p>
                        <p>Location: {job.jobLocation}</p>
                        <p>Function: {job.jobFunction}</p>
                        <p>Seniority Level: {job.seniorityLevel}</p>
                        <p>Employment Type: {job.employmentType}</p>
                        <p>Industry Type: {job.industryType}</p>
                        <p>Experience: {job.experience}</p>
                        <p>Number of Applicants: {job.numberofApplicants}</p>
                        <p>Posting Date: {job.postingDate}</p>
                        {/* You can add more fields as needed */}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Jobs;
