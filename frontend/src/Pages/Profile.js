// Profile.js
import React from "react";
import BackgroundBanner from "../Components/BackgroundBanner";
import Skills from "../Components/Skills";
import Projects from "../Components/Projects";
import Experience from "../Components/Experience";

const Profile = ({ showHalfProfile, isHomePage }) => {
  return (
    <div className={`backgroundColor ${isHomePage? 'homePageStyles' : ''}`}>
      {showHalfProfile ? (
        <div>
          <BackgroundBanner isHomePage= {isHomePage}  />
          <Experience isHomePage= {isHomePage} />
        </div>
      ) : (
        <div>
          <BackgroundBanner />
          <Experience />
          <Skills />
          <Projects />
        </div>
      )}
    </div>
  );
};

export default Profile;
