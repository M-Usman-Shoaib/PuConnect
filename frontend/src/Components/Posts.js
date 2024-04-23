
// export default Posts;
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../CSS/Posts.css"; // Import CSS file for styling

const Posts = () => {
  const token = useSelector((state) => state.auth.token);
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch all posts and user's posts
        const allPostsResponse = await axios.get("http://localhost:3000/post/getAll", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userPostsResponse = await axios.get("http://localhost:3000/post/get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); 

        // Combine all posts and user's posts into a single array
        const mergedPosts = [...allPostsResponse.data, ...userPostsResponse.data];

        // Set the merged array to the state
        setAllPosts(mergedPosts);
      } catch (error) {
        console.log("Error fetching posts", error);
      }
    };

    fetchPosts();
  }, [token]); // Make sure to include token in the dependency array

  return (
    <div className="posts-container">
      {allPosts.map((post) => (
        <div key={post._id} className="post">
          <div className="user-info">
            {post.userPicturePath && (
              <img
                src={`data:image/jpeg;base64,${post.userPicturePath}`}
                alt="User"
                className="user-photo"
              />
            )}
            <strong className="user-name">{post.userName}</strong>
          </div>
          <div className="post-description">{post.description}</div>
          <div className="user-info">
          {post.picturePath && (
             <img src={`data:image/jpeg;base64,${post.picturePath}`} alt="Post" className="post-image" />
          )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Posts;
