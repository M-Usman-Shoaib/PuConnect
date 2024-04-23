import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../CSS/Users.css"; // Import CSS file for styling

const AllUsers = () => {
    const token = useSelector((state) => state.auth.token);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                // Fetch all users
                const response = await axios.get("http://localhost:3000/connection/allUsers", {
                    headers: {
                        Authorization: `Bearer ${token}` // Provide your authentication token here
                    }
                });

                // Set the fetched users to the state
                setAllUsers(response.data);
                setLoading(false); // Set loading to false after data is fetched
            } catch (error) {
                console.log("Error fetching all users", error);
            }
        };

        fetchAllUsers();
    }, [token]); // Include token in dependencies array

    return (
        <div className="container">
            <h2 className="title">All Users</h2>
            <div className="list-container"> {/* Separate container for the list with scrolling */}
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className="list">
                        {allUsers.map((user, index) => (
                            <div key={index} className="user">
                                {user.profilePic && (
                                    <img
                                        src={`data:image/jpeg;base64,${user.profilePic}`}
                                        alt="User"
                                        className="photo"
                                    />
                                )}
                                <div className="info">
                                    <div className="name">{user.name}</div>
                                    <div className="roll-no">{user.rollNo}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllUsers;
