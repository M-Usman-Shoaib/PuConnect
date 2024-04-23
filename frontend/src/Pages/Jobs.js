import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Alert from '../Components/Alert';
import JobsComponent from '../Components/Jobs'; 

const Jobs = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAlert(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="ps-3 pt-2">
      <div className="row">
        <div className="col col-6">
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }} className="posts-container">
            <JobsComponent />
          </div>
        </div>
      </div>
      {showAlert && <Alert type="danger" message="Please login first." />}
    </div>
  );
};

export default Jobs;
