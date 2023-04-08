import React, { useState, useEffect } from "react";
import M from "materialize-css";
import { useNavigate, useParams } from "react-router-dom";

const EditPost = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");

  const { postId } = useParams();

  useEffect(() => {
    if (url) {
      fetch(`/editpost/${postId}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          title,
          body,
          pic: url,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            M.toast({ html: data.error, classes: "#d32f2f red darken-2" });
          } else {
            M.toast({
              html: "Edited Post Successfully",
              classes: "#689f38 light-green darken-2",
            });
            navigate("/");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [url, postId]);

  const postDetails = () => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "cloneInsta");
    data.append("cloud_name", "cloudast");
    fetch("https://api.cloudinary.com/v1_1/cloudast/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setUrl(data.url);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className="card input-filed"
      style={{
        margin: "30px auto",
        maxWidth: "500px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="file-field input-field">
        <button className="btn-small waves-effect waves-light #2196f3 blue">
          <span>Upload Image</span>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </button>
        <div className="file-path-wrapper">
          <input className="file-path validate" type="text" />
        </div>
      </div>
      <button
        className="btn waves-effect waves-light #2196f3 blue"
        onClick={() => postDetails()}
      >
        Update Post
      </button>
    </div>
  );
};

export default EditPost;
