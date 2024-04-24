// Import the Express framework for creating routers
const express = require("express");

// Create an instance of the Express Router
const router = express.Router();

// Import the User model for database interactions
const User = require('../models/User');

// Import the getToken function from the "helpers" module in the "utilities" directory
const { getToken } = require("../utilities/helpers");

// Import the bcrypt library for password hashing and comparison
const bcrypt = require("bcrypt");

const ProfilePicture = require('../models/ProfilePicture');


//This is the route for registering a user
router.post("/register", async (req, res) => {
    //This is the function that will handle the register user logic
    //Steps:

    // 1) Get the details from req.body.
    const { name, email, gender, semester, password } = req.body;

    if (!name || !email || !gender || !semester || !password) {
        return res.status(400).json({ err: "Invalid request body" });
    }

    // 2) We will check if the email of a user is already exist.This is not allowed.
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.status(402).json({ err: "A user with this email already exists" });
    }

    // 3) If the user is legitimate then we will creat its account.

    //We first hashed the password then store it in DB
    const hashedPassword = await bcrypt.hash(password, 10);

    const emailPattern = /^([a-zA-Z]+)(\d{2})([a-zA-Z]\d{3})@pucit.edu.pk$/;

    const match = emailPattern.exec(email);
    
    if (!match) {
        return res.status(400).json({ err: "Invalid email" });
    }
    
    // Extracted values
    const rollNo = match[0].slice(0, -13).toUpperCase(); // Entire match, i.e., bitf20a023
    const degree = `BS(${match[1].slice(1, -1).toUpperCase()})`; // Two letters after "b", i.e., it
    const batch = `F${match[2]}`; // Two digits after "f", i.e., 20
        
    const newUserDetails = { 
        name, 
        email,
        gender,
        semester, 
        degree,
        rollNo,
        batch,
        password: hashedPassword 
    };

    const newUser = await User.create(newUserDetails)

    //Create default profile picture for the user
    const defaultProfile = await ProfilePicture.findOrCreateDefault(newUser._id);


    // 4) Using the newUser to create a JWT and return the token to the user.
    const token = await getToken(email, newUser);

    //We want to return the following to the user
    //1. The actual user created
    //2. The token

    const userToReturn = {...newUser.toJSON(), token};
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

router.post("/login", async(req, res)=>{
    //This is the function that will handle the login user logic

    //Steps:
    //1. we get the details from req.body
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(401).json({err: "Invalid user"})
    }

    //2. verify the user exists with this email or not
    const user = await User.findOne({email: email});

    if(!user){
        return res.status(401).json({err: "Invalid user"})
    }

    //3. verify if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(401).json({err: "Invalid user"})
    }

    //4. generate a token for the user and return it
    const token = await getToken(email, user);
    const userToReturn = {...user.toJSON(), token};
    delete userToReturn.password;
    return res.status(200).json(userToReturn);

}); 



module.exports = router;