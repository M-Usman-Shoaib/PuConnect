const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require("../models/User");
const ProfilePicture = require("../models/ProfilePicture")

const router = express.Router();

router.patch("/sendRequest/:receiverId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    
    // Validate if the provided user ID is valid
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.receiverId);
    if (!isValidObjectId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find the user who sent the request (authenticated user)
    const senderUser = await User.findById(req.user._id);
    if (!senderUser) {
      return res.status(404).json({ message: "Sender user not found" });
    }

    // Find the user to whom the request is sent
    const receiverUser = await User.findById(req.params.receiverId);
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    // Check if the sender and receiver are the same
    if (senderUser._id.toString() === receiverUser._id.toString()) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    // Check if the request has already been sent
    if (senderUser.sentRequest.some((request) => request.friendId.toString() === receiverUser._id.toString())) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Check if the receiver is already in the sender's friend list
    if (senderUser.friendsList.some((friend) => friend.friendId.toString() === receiverUser._id.toString())) {
      return res.status(400).json({ message: "User is already in your friend list" });
    }

    // Update the sender's sentRequest
    senderUser.sentRequest.push({
      friendId: receiverUser._id,
      friendEmail: receiverUser.email,
    });

    // Update the receiver's request
    receiverUser.request.push({
      friendId: senderUser._id,
      friendEmail: senderUser.email,
    });

    // Update the receiver's totalRequest
    receiverUser.totalRequest += 1;

    // Save changes to the database
    await senderUser.save();
    await receiverUser.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.patch("/acceptRequest/:senderId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    // Find the user who is accepting the request (authenticated user)
    const receiverUser = await User.findById(req.user._id);
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    // Find the user who sent the request (the sender)
    const senderUser = await User.findById(req.params.senderId);
    if (!senderUser) {
      return res.status(404).json({ message: "Sender user not found" });
    }

    // Check if the request is in the receiver's request list
    const requestIndex = receiverUser.request.findIndex(
      (request) => request.friendId.toString() === senderUser._id.toString()
    );
    if (requestIndex === -1) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Remove the request entry from the receiver's request list
    receiverUser.request.splice(requestIndex, 1);

    // Add the sender to the receiver's friend list
    receiverUser.friendsList.push({
      friendId: senderUser._id,
      friendEmail: senderUser.email,
    });

    // Update the receiver's totalRequest
    receiverUser.totalRequest -= 1;

    // Save changes to the database for the receiver
    await receiverUser.save();

    // Check if the request is in the sender's sentRequest list
    const sentRequestIndex = senderUser.sentRequest.findIndex(
      (request) => request.friendId.toString() === receiverUser._id.toString()
    );
    if (sentRequestIndex === -1) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Remove the sentRequest entry from the sender's sentRequest list
    senderUser.sentRequest.splice(sentRequestIndex, 1);

    // Add the receiver to the sender's friend list
    senderUser.friendsList.push({
      friendId: receiverUser._id,
      friendEmail: receiverUser.email,
    });

    // Save changes to the database for the sender
    await senderUser.save();

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.patch("/rejectRequest/:senderId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    // Find the user who is rejecting the request (authenticated user)
    const receiverUser = await User.findById(req.user._id);
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    // Find the user who sent the request (the sender)
    const senderUser = await User.findById(req.params.senderId);
    if (!senderUser) {
      return res.status(404).json({ message: "Sender user not found" });
    }

    // Check if the request is in the receiver's request list
    const requestIndex = receiverUser.request.findIndex(
      (request) => request.friendId.toString() === senderUser._id.toString()
    );
    if (requestIndex === -1) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Remove the request entry from the receiver's request list
    receiverUser.request.splice(requestIndex, 1);

    // Update the receiver's totalRequest
    receiverUser.totalRequest -= 1;

    // Save changes to the database for the receiver
    await receiverUser.save();

    // Check if the request is in the sender's sentRequest list
    const sentRequestIndex = senderUser.sentRequest.findIndex(
      (request) => request.friendId.toString() === receiverUser._id.toString()
    );
    if (sentRequestIndex === -1) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Remove the sentRequest entry from the sender's sentRequest list
    senderUser.sentRequest.splice(sentRequestIndex, 1);

    // Save changes to the database for the sender
    await senderUser.save();

    res.status(200).json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.patch("/removeFriend/:friendId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    // Find the user who is removing the friend (authenticated user)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the friend user to be removed
    const friendUser = await User.findById(req.params.friendId);
    if (!friendUser) {
      return res.status(404).json({ message: "Friend user not found" });
    }

    // Check if the friend is in the user's friend list
    const friendIndex = user.friendsList.findIndex(
      (friend) => friend.friendId.toString() === friendUser._id.toString()
    );
    if (friendIndex === -1) {
      return res.status(404).json({ message: "Friend not found in the friend list" });
    }

    // Remove the friend entry from the user's friend list
    user.friendsList.splice(friendIndex, 1);

    // Save changes to the database for the user
    await user.save();

    // Check if the user is in the friend's friend list
    const userIndexInFriend = friendUser.friendsList.findIndex(
      (friend) => friend.friendId.toString() === user._id.toString()
    );
    if (userIndexInFriend === -1) {
      return res.status(404).json({ message: "User not found in the friend's friend list" });
    }

    // Remove the user entry from the friend's friend list
    friendUser.friendsList.splice(userIndexInFriend, 1);

    // Save changes to the database for the friend
    await friendUser.save();

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to fetch all users in the system
router.get("/allUsers", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    // Find all users in the database
    const allUsers = await User.find({}, { password: 0 }); // Exclude password from the response

    if (!allUsers) {
      return res.status(404).json({ message: "No users found" });
    }

    // Populate profile picture for each user
    await Promise.all(allUsers.map(async (user) => {
      const profilePicture = await ProfilePicture.findOne({ userId: user._id });
      user.profilePic = profilePicture ? profilePicture.image : "/backend/image/defaultProfile.png"; // Add profile picture to user object
    }));

    // Return the list of all users with profile pictures
    res.status(200).json(allUsers.map(user => ({
      _id: user._id,
      name: user.name,
      rollNo: user.rollNo,
      profilePic: user.profilePic // Include profile picture in response
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to get all users in the friend list of the authenticated user
router.get("/friends", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
      // 1. Identify the user who is calling it
      const user = req.user;

      // 2. Retrieve all friends of the user
      const friends = await User.find({ _id: { $in: user.sentRequest.map(friend => friend.friendId) } });

      if (!friends) {
          return res.status(404).json({ err: "No friends found" });
      }

       // Populate profile picture for each user
    await Promise.all(friends.map(async (friend) => {
      const profilePicture = await ProfilePicture.findOne({ userId: friend._id });
      friend.profilePic = profilePicture ? profilePicture.image : "null"; // Assign default pic if profilePic is null
    }));

      // 4. Return the friends as a response
      return res.status(200).json(friends.map(friend => ({
          _id: friend._id,
          name: friend.name,
          rollNo: friend.rollNo,
          profilePic: friend.profilePic 
      })));
  } catch (err) {
      console.error(err);
      return res.status(500).json({ err: "Internal Server Error" });
  }
});

module.exports = router;
