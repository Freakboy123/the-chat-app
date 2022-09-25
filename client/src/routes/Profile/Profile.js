import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../UserContext";
import "./Profile.css";
import { Snackbar, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const applyBtn = useRef();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activate, setActivate] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  useEffect(() => {
    if (!user) {
      console.log(user);
      navigate("/login");
    }
  }, []);

  const activateApplyBtn = () => {
    console.log(password.trim().length);
    if (
      confirmPassword === password &&
      username.trim().length &&
      username.trim().length <= 20
    ) {
      if (password.trim().length !== 0) {
        console.log("PASSWORD");
        setActivate(true);
      } else if (username.trim() !== user.username) {
        console.log("USERNAME");
        setActivate(true);
      } else {
        console.log("FALSE");
        setActivate(false);
      }
    } else {
      console.log("FALSE");
      setActivate(false);
    }
  };

  useEffect(() => {
    activateApplyBtn();
  }, [email, username, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const req = await fetch("/api/profile/changeProfile", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        confirmPassword,
      }),
    });
    const res = await req.json();
    console.log(res);
    if (req.status === 400) {
      setMsg(res.msg);
    } else if (req.status === 200) {
      setUser({
        email: res.email,
        avatar: res.avatar,
        username: res.username,
        id: res._id,
      });
      console.log(user);
      setMsg("Changes Saved!");
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
    setOpen(true);
  };
  const handleBackClick = () => {
    navigate("/");
  };
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div className="profileContainer">
      <div className="title">
        <h1 style={{ color: "#36d692" }}>Profile</h1>
      </div>
      {loading ? (
        <div
          className="profileFormContainer"
          style={{
            display: "flex",
            justifyContent: "center",
            // borderStyle: "solid",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <div className="profileFormContainer">
          <form onSubmit={handleSubmit}>
            <div className="formInput">
              <label htmlFor="email" style={{ fontWeight: "600" }}>
                Email
              </label>
              <input
                disabled
                style={{
                  backgroundColor: "#828181",
                  color: "#000000",
                }}
                className="textInput"
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <div className="formInput">
              <label htmlFor="username" style={{ fontWeight: "600" }}>
                Username
              </label>
              <input
                required
                className="textInput"
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div className="formInput">
              <label htmlFor="password" style={{ fontWeight: "600" }}>
                New password
              </label>
              <input
                className="textInput"
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <div className="formInput">
              <label htmlFor="confirmPassword" style={{ fontWeight: "600" }}>
                Confirm new password
              </label>
              <input
                className="textInput"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </div>
            {confirmPassword !== password && (
              <p style={{ textAlign: "center", color: "red" }}>
                <b>X</b> Passowrd and Confirm Password don't match
              </p>
            )}
            {username.length > 20 && (
              <p style={{ textAlign: "center", color: "red" }}>
                <b>X</b> Username cannot be longer than 20 characters
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <input
                disabled={!activate}
                type="submit"
                onSubmit={handleSubmit}
                value="Apply changes"
                ref={applyBtn}
              />
              <input
                type="submit"
                value="Back"
                onClick={() => {
                  handleBackClick();
                }}
              />
              <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={msg}
                action={action}
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
