import React, { useState, useContext } from "react";
import { Button, Checkbox, TextField, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import UserContext from "../../UserContext";

import "./FormStyling.css";
import { useNavigate } from "react-router-dom";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const req = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        password,
        confirmPassword,
      }),
    });
    const res = await req.json();
    if (req.status === 200) {
      console.log(res);
      navigate("/");
      setUser({
        email,
        avatar: null,
        username: res.username,
        id: res.id,
        _id: res.id,
      });
    } else {
      let newError = res.msg;
      if (newError.length === 0) {
        setError("There was a problem with the server!");
      } else {
        setError(newError);
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.05,
      }}
      className="formContainer"
    >
      <h2 style={{ color: "black", fontWeight: "900" }}>Sign Up</h2>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        onSubmit={handleSubmit}
      >
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            display: "flex",

            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flex: "1" }}>
            <TextField
              required
              className="outlined-basic"
              style={{ flex: "1" }}
              type="email"
              label="Email"
              variant="outlined"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              style={{ flex: "1" }}
              required
              className="outlined-basic"
              type="text"
              label="Username"
              variant="outlined"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
          </div>
          <TextField
            required
            className="outlined-basic"
            type="password"
            label="Password"
            variant="outlined"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <TextField
            required
            className="outlined-basic"
            type="password"
            label="Confirm Password"
            variant="outlined"
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />
        </div>
        <div
          style={{
            width: "50vw",
          }}
        >
          {error.length > 0 && !loading && (
            <p className="err-msg" style={{ textAlign: "center" }}>
              <span style={{ color: "red", fontWeight: "900" }}>X</span> {error}
            </p>
          )}
        </div>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              // borderStyle: "solid",
              backgroundColor: "#0ac493",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <Button
            style={{
              color: "white",

              backgroundColor: "#0ac493",
            }}
            type="submit"
          >
            Login
          </Button>
        )}
      </form>
    </motion.div>
  );
};

export default SignUpForm;
