import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const FriendList = () => {
    const token = useSelector((state) => state.auth.token);
    const [Friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                // Fetch user's friends
                const response = await axios.get("http://localhost:3000/connection/friends", {
                    headers: {
                        Authorization: `Bearer ${token}` // Provide your authentication token here
                    }
                });

                // Set the user's friends to the state
                setFriends(response.data);
            } catch (error) {
                console.log("Error fetching user's friends", error);
            }
        };

        fetchFriends();
    }, [token]); // Include token in dependencies array

    const handleRemoveFriend = async (friendId) => {
        try {
            // Send request to remove friend
            await axios.patch(`http://localhost:3000/connection/removeFriend/${friendId}`, null, {
                headers: {
                    Authorization: `Bearer ${token}` // Provide your authentication token here
                }
            });

            // Remove the friend from the state
            setFriends(prevFriends => prevFriends.filter(friend => friend._id !== friendId));

            // Display success message
            alert("Friend removed successfully");
        } catch (error) {
            console.error("Error removing friend", error);
            // Display error message
            alert("Error removing friend");
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col col-9">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="mb-0">Friends</h5>
                            {Friends.length === 0 ? (
                                <p className="card-text mt-4">You have no friends.</p>
                            ) : (
                                // Display the list of friends
                                <div className="mt-4">
                                    {Friends.map((friend) => (
                                        <div key={friend._id} className="mb-4 d-flex align-items-center">
                                            <div className="user-info">
                                                {friend.profilePic && (
                                                    <img
                                                        src={`data:image/jpeg;base64,${friend.profilePic}`}
                                                        alt="User"
                                                        className="user-photo"
                                                    />
                                                )}
                                                <div className="info">
                                                    <div className="name">{friend.name}</div>
                                                    <div className="roll-no">{friend.rollNo}</div>
                                                </div>
                                            </div>
                                            {/* Display Remove button */}
                                            <button
                                                className="btn btn-danger ms-auto"
                                                onClick={() => handleRemoveFriend(friend._id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col col-3"></div>
            </div>
        </div>
    );
};

export default FriendList;
