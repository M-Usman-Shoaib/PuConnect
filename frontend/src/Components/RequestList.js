import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const RequestList = () => {
    const token = useSelector((state) => state.auth.token);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // Fetch received friend requests
                const response = await axios.get("http://localhost:3000/connection/receivedRequests", {
                    headers: {
                        Authorization: `Bearer ${token}` // Provide your authentication token here
                    }
                });

                // Set the received friend requests to the state
                setRequests(response.data);
            } catch (error) {
                console.log("Error fetching received requests", error);
            }
        };

        fetchRequests();
    }, [token]); // Include token in dependencies array

    const acceptRequest = async (senderId) => {
        try {
            // Send a PATCH request to accept the friend request
            const response = await axios.patch(`http://localhost:3000/connection/acceptRequest/${senderId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}` // Provide your authentication token here
                }
            });
            // Show success message
            alert(response.data.message);
            // Remove the accepted request from the list
            setRequests(requests.filter(request => request._id !== senderId));
        } catch (error) {
            console.error("Error accepting request", error);
            // Display error message
            alert("Error accepting request");
        }
    };

    const rejectRequest = async (senderId) => {
        try {
            // Send a PATCH request to reject the friend request
            const response = await axios.patch(`http://localhost:3000/connection/rejectRequest/${senderId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}` // Provide your authentication token here
                }
            });
            // Show success message
            alert(response.data.message);
            // Remove the rejected request from the list
            setRequests(requests.filter(request => request._id !== senderId));
        } catch (error) {
            console.error("Error rejecting request", error);
            // Display error message
            alert("Error rejecting request");
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col col-9">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="mb-0">Requests</h5>
                            {requests.length === 0 ? (
                                <p className="card-text mt-4">You have no requests.</p>
                            ) : (
                                <div className="mt-4">
                                    {requests.map((request) => (
                                        <div key={request._id} className="mb-4">
                                            <div className="user-info">
                                                {request.profilePic && (
                                                    <img
                                                        src={`data:image/jpeg;base64,${request.profilePic}`}
                                                        alt="User"
                                                        className="user-photo"
                                                    />
                                                )}
                                                <div className="info">
                                                    <div className="name">{request.name}</div>
                                                    <div className="roll-no">{request.rollNo}</div>
                                                </div>
                                            </div>
                                            {/* Button to accept the request */}
                                            <button className="greyButton mr-2" type="button" onClick={() => acceptRequest(request._id)}>Accept</button>
                                            {/* Button to reject the request */}
                                            
                                            <button  className="btn btn-danger ms-auto" type="button" onClick={() => rejectRequest(request._id)}>Reject</button>
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

export default RequestList;
