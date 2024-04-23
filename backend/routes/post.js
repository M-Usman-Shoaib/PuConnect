const express = require("express");
const router = express.Router();
const passport = require("passport");
const Post = require('../models/Post');
const ProfilePicture = require('../models/ProfilePicture');
const multer = require('multer'); // Import multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/create", passport.authenticate("jwt", { session: false }), upload.single('picture'), async (req, res) => {

    // 1. Identify the user who is calling it
    const user = req.user;

    // Fetch user's profile picture
    const profilePicture = await ProfilePicture.findOrCreateDefault(user._id);


    // 2. Create the post object
    const { description } = req.body;
    const pictureData = req.file; // Get the picture file data

    if (!description) {
        return res.status(400).json({ err: "Description is required!" })
    }

    if (!req.file || !description) {
        return res.status(400).json({ error: "Both description and picture are required!" });
    }

    const { buffer } = req.file; // Get the picture file buffer
    const picturePath = buffer.toString('base64');
    const userPicturePath = profilePicture.image;
    
    const postObj = {
        userId: user._id,
        userName: user.name,
        description,
        picturePath,
        userPicturePath,
        likes: {},
    };

    const post = await Post.create(postObj);

    // 3. Return a response
    return res.status(200).json(post);

});


//Route to view all feed posts
router.get("/getAll", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find all posts except those of the logged-in user
        const posts = await Post.find({ userId: { $ne: loggedInUserId } });

        res.status(200).json(posts);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// Route to view posts of the logged-in user
router.get("/get", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find all posts of the logged-in user
        const posts = await Post.find({ userId: loggedInUserId });

        res.status(200).json(posts);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// Route to like a post
// This route take "post id" as a parameter
router.patch("/like/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const id  = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(id);
        const isLiked = post.likes.get(userId);
    
        if (isLiked) {
          post.likes.delete(userId);
        } else {
          post.likes.set(userId, true);
        }
    
        const updatedPost = await Post.findByIdAndUpdate(
          id,
          { likes: post.likes },
          { new: true }
        );
    
        res.status(200).json(updatedPost);
      } catch (err) {
        res.status(404).json({ message: err.message });
      }
});

//Route to comment a post
router.post("/comment/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        // Check if the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Extract comment data from the request body
        const { text } = req.body;

        // Create a new comment object
        const newComment = {
            userId: userId,
            text: text,
        };

        // Add the comment to the post's comments array
        post.comments.push(newComment);

        // Save the updated post with the new comment
        const updatedPost = await post.save();

        res.status(201).json(updatedPost);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Route to delete a post
router.delete("/delete/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        // Check if the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user is the owner of the post
        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You do not have permission to delete this post" });
        }

        // Delete the post
        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

//Route to update a post
router.patch("/update/:id", passport.authenticate("jwt", { session: false }), upload.single('picture'), async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        // Check if the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user is the owner of the post
        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You do not have permission to update this post" });
        }

        // Update the post
        const { description } = req.body;
        const pictureData = req.file;

        if (!description) {
            return res.status(400).json({ message: "Description is required!" });
        }

        if (pictureData) {
            // Convert picture data to base64 string
            const picturePath = pictureData.buffer.toString('base64');
            post.picturePath = picturePath;
        }

        post.description = description;

        // Save the updated post
        const updatedPost = await post.save();

        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});






module.exports = router;