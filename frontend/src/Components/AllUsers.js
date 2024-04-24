import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../CSS/Users.css"; // Import CSS file for styling

const AllUsers = () => {
    const token = useSelector((state) => state.auth.token);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestsSent, setRequestsSent] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

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

    useEffect(() => {
        // Fetch friends list, requests sent, and received requests
        const fetchUserData = async () => {
            try {
                // Fetch friends list
                const friendsResponse = await axios.get("http://localhost:3000/connection/friends", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const friends = friendsResponse.data.map(friend => friend._id);
                setFriendsList(friends);

                // Fetch sent requests
                const sentRequestsResponse = await axios.get("http://localhost:3000/connection/sentRequests", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const sentRequests = sentRequestsResponse.data.map(request => request.friendId);
                setRequestsSent(sentRequests);

                // Fetch received requests
                const receivedRequestsResponse = await axios.get("http://localhost:3000/connection/receivedRequests", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const receivedRequests = receivedRequestsResponse.data.map(request => request.friendId);
                setReceivedRequests(receivedRequests);
            } catch (error) {
                console.error("Error fetching user data", error);
            }
        };

        fetchUserData();
    }, [token]);

    const sendRequest = async (receiverId) => {
        try {
            const response = await axios.patch(`http://localhost:3000/connection/sendRequest/${receiverId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}` // Provide your authentication token here
                }
            });
            alert(response.data.message); // Show response message
            // Add the receiverId to requestsSent array
            setRequestsSent([...requestsSent, receiverId]);
        } catch (error) {
            console.error("Error sending request", error);
            let errorMessage = "Error sending request";
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage = error.response.data.message;
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No response received from server";
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message;
            }
            alert(errorMessage);
        }
    };

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
                                    {/* Display the button only if request has not been sent */}
                                   {!(friendsList.includes(user._id) || requestsSent.includes(user._id) || receivedRequests.includes(user._id)) && (
                                        <button className="greyButton" type="button" onClick={() => sendRequest(user._id)}>Send Request</button>
                                    )}
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
