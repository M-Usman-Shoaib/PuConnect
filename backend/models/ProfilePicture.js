const mongoose = require('mongoose');
const fs = require('fs'); // Importing the fs module
const multer = require('multer'); 

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const profilePictureSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});
profilePictureSchema.statics.findOrCreateDefault = async function (userId) {
  try {
    // Check if a default profile picture already exists for the user
    let defaultProfile = await this.findOne({ userId, isDefault: true });

    if (defaultProfile) {
      return defaultProfile;
    }

    // If no default profile picture found, check for the latest non-default picture
    const latestProfilePicture = await this.findOne({ userId, isDefault: false }).sort({ createdAt: -1 });

    if (latestProfilePicture) {
      return latestProfilePicture;
    }

    // If no default or non-default profile picture found, create a new default profile picture
    const imageBuffer = fs.readFileSync('./image/defaultProfile.png');
    const base64Image = imageBuffer.toString('base64');

    if (!base64Image) {
      throw new Error('Error converting file to base64');
    }

    // Create a new default profile picture document
    const newDefaultProfilePicture = new this({
      userId,
      image: base64Image,
      isDefault: true,
    });

    // Save the new default profile picture document to the database
    await newDefaultProfilePicture.save();

    return newDefaultProfilePicture;
  } catch (error) {
    console.error(error);
    throw new Error('Error finding or creating default profile picture');
  }
};


const ProfilePicture = mongoose.model('ProfilePicture', profilePictureSchema);

module.exports = ProfilePicture;
