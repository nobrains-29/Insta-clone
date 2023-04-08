import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";

const Profile = () => {
  const [mypics, setMypics] = useState([]);
  const [image, setImage] = useState("");
  const { state, dispatch } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/myposts", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setMypics(result.myposts);
      });
  }, []);

  useEffect(() => {
    if (image) {
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
          fetch("/updatepic", {
            method: "put",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
              pic: data.url,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              console.log(result);
              localStorage.setItem(
                "user",
                JSON.stringify({ ...state, pic: result.pic })
              );
              dispatch({ type: "UPDATEPIC", payload: result.pic });
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [image]);

  const updatePhoto = (file) => {
    setImage(file);
  };

  const deleteUser = async () => {
    await fetch(`/deleteuser`, {
      method: "delete",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        localStorage.clear();
        dispatch({ type: "CLEAR" });
        navigate("/signin");
      });
  };

  return (
    <div style={{ maxWidth: "650px", margin: "0px auto" }}>
      <div
        style={{
          margin: "18px 0px",
          borderBottom: "1px solid grey",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <div>
            <img
              style={{ width: "160px", height: "160px", borderRadius: "80px" }}
              src={state ? state.pic : "Loading..."}
            />
          </div>
          <div>
            <h4>{state ? state.name : "Loading"}</h4>
            <h5>{state ? state.email : "Loading"}</h5>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "108%",
              }}
            >
              <h6>{mypics.length} posts</h6>
              <h6>{state ? state.followers.length : 0} followers</h6>
              <h6>{state ? state.following.length : 0} following</h6>
            </div>
          </div>
          <div>
            {state ? (
              <i
                className="material-icons"
                style={{ float: "right" }}
                onClick={() => deleteUser(state._id)}
              >
                delete
              </i>
            ) : (
              ""
            )}
            {state ? (
              <Link to={`/edituser/${state._id}`}>
                <i className="material-icons" style={{ float: "right" }}>
                  edit
                </i>
              </Link>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="file-field input-field" style={{ margin: "10px" }}>
          <button className="btn-small waves-effect waves-light #2196f3 blue">
            <span>Update Pic</span>
            <input
              type="file"
              onChange={(e) => updatePhoto(e.target.files[0])}
            />
          </button>
          <div className="file-path-wrapper">
            <input className="file-path validate" type="text" />
          </div>
        </div>
      </div>
      <div className="gallery">
        {mypics.map((item) => {
          return (
            <img
              key={item._id}
              className="item"
              src={item.photo}
              alt={item.title}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
