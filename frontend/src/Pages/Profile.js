import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../Redux Toolkit/authSlice';
import CustomModal from '../Components/CustomModal';

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [userId, setUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setUserId(user._id);
    }
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }

    if (!userId) {
      console.error('User ID is undefined');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(`http://localhost:3000/bg-banner/${userId}`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Assuming your API returns the updated user object
        const updatedUser = await response.json();

        // Dispatch the login action with the updated user object
        dispatch(login(updatedUser));

        // Update the local state with the new user object
        setUserId(updatedUser._id);

        // Fetch the banner image URL separately
        const bannerImageResponse = await fetch(`http://localhost:3000/bg-banner/${userId}`);
        const bannerImage = await bannerImageResponse.json();

        console.log('Banner uploaded Successfully', bannerImage.imageUrl);

      } else {
        console.error('Error uploading banner', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading banner', error);
    }
  };


  useEffect(() => {
    // Log the banner image URL after the user state is updated
    if (user && user.bannerImageUrl) {
      console.log('Banner Image URL:', `http://localhost:3000/${user.bannerImageUrl}`);
      
    }
  }, [user]);

  useEffect(() => {
    // Log "nothing" if user state is still undefined
    if (!user) {
      console.log("nothing");
    }
  }, [user]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      
      {/* Display the user's banner image */}
      {user && user.bannerImageUrl && (
        <img src={`http://localhost:3000/${user.bannerImageUrl}`} alt="User Banner" />
      )}

      <div
        className="d-inline-block p-2 bg-primary text-white"
        style={{ cursor: 'pointer' }}
        onClick={openModal}
      >
        Choose image
      </div>

      <CustomModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
      />
    </>
  );
};

export default Profile;
