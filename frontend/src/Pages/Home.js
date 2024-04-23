import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Alert from '../Components/Alert';
import Profile from './Profile';
import DefaultPost from '../Components/DefaultPost';
import Posts from '../Components/Posts';
import Users from '../Components/AllUsers';

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Show an alert if the user is not authenticated
    if (!isAuthenticated) {
      setShowAlert(true);
      // Redirect to the login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000); // You can adjust the delay as needed
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="backgroundColor pb-5">
      {isAuthenticated ? (
        <div className="ps-3 pt-2">
          <div className="row">
            <div className="col col-3">
              {/* Display only BackgroundBanner and Skills in the left column */}
              <Profile showHalfProfile={true} isHomePage={true} />
            </div>
            <div className="col col-6">
              <DefaultPost isPostPic={true} />
              <br />
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }} className="posts-container"> {/* Set a fixed height and make it scrollable */}
                <Posts />
              </div>
            </div>
            <div className="col col-3"><Users/></div>
          </div>
        </div>
      ) : (
        // Display an alert if the user is not authenticated
        showAlert && <Alert type="danger" message="Please login first." />
      )}
    </div>
  );
};

export default Home;
