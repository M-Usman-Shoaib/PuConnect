import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../CSS/Users.css"; // Import CSS file for styling


const FriendList = () => {
    const token = useSelector((state) => state.auth.token);
    const [sentRequests, setSentRequests] = useState([]);

    useEffect(() => {
        const fetchSentRequests = async () => {
            try {
                // Fetch sent friend requests
                const response = await axios.get("http://localhost:3000/connection/friends", {
                    headers: {
                        Authorization: `Bearer ${token}` // Provide your authentication token here
                    }
                });

                // Set the sent friend requests to the state
                setSentRequests(response.data);
            } catch (error) {
                console.log("Error fetching sent requests", error);
            }
        };

        fetchSentRequests();
    }, [token]); // Include token in dependencies array

    return (
        <div className="container">
            <h2 className="title">Connections</h2>
            <div className="list-container"> {/* Separate container for the list with scrolling */}

                <div className="list">
                    {sentRequests.map((user, index) => (
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
            </div>
        </div>
    );
};

export default FriendList;
