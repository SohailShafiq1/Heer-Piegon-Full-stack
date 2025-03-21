import React, { useState, useEffect } from "react";
import axios from "axios";
import style from "./post.module.css";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaMinusCircle } from "react-icons/fa";

const s = style;

const Post = () => {
  const [add, setAdd] = useState(false);
  const [posts, setPosts] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");

  // Fetch posts from backend
  useEffect(() => {
    axios
      .get("http://localhost:5001/api/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload post to backend
  const handleUpload = async () => {
    if (!file || !name) {
      alert("Please select an image and enter a name.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", name);

    try {
      const res = await axios.post("http://localhost:5001/api/posts", formData);
      setPosts([...posts, res.data]); // Update UI with new post
      setAdd(false);
      setFile(null);
      setName("");
    } catch (err) {
      console.log(err);
    }
  };

  // Delete a post
  const removePost = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/posts/${id}`);
      setPosts(posts.filter((post) => post._id !== id)); // Update UI
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.top}>
        <h1>Posts</h1>
        <IoAddCircleOutline className={s.add} onClick={() => setAdd(!add)} />
      </div>

      {add && (
        <div className={s.uploadPhoto}>
          <h1>Add Photo</h1>
          <input
            type="file"
            className={s.fileInput}
            onChange={handleFileChange}
          />
          <input
            type="text"
            className={s.filenameInput}
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className={s.uploadButton} onClick={handleUpload}>
            Upload Photo
          </button>
          <button
            className={s.uploadButton}
            onClick={() => {
              setAdd(!add);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className={s.table}>
        <table className={s.posttable}>
          <thead>
            <tr>
              <th>Count</th>
              <th>Image</th>
              <th>Name</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post._id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={post.imageUrl}
                    alt={post.name}
                    className={s.postImage}
                  />
                </td>
                <td>{post.name}</td>
                <td>
                  <FaMinusCircle
                    className={s.remove}
                    onClick={() => removePost(post._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Post;
