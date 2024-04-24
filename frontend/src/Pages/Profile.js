import React from "react";
import BackgroundBanner from "../Components/BackgroundBanner";
import Skills from "../Components/Skills";
import Projects from "../Components/Projects";
import Experience from "../Components/Experience";
import FriendList from "../Components/FriendList"; // Import the FriendRequests component
import RequestList from "../Components/RequestList"; // Import the FriendRequests component


const Profile = ({ showHalfProfile, isHomePage }) => {
  return (
    <div className={`backgroundColor ${isHomePage ? "homePageStyles" : ""}`}>
      <div style={{ position: "relative" }}>
        {showHalfProfile ? (
          <div>
            <BackgroundBanner
              isHomePage={isHomePage}
              isProfilePage={true}
            />
            <Experience isHomePage={isHomePage} />
          </div>
        ) : (
          <div>
            <BackgroundBanner isProfilePage={true} />
            <Experience />
            <Skills />
            <Projects />
            <FriendList />
            <RequestList />y
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
