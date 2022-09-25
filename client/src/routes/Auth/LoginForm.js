import React, { useState, useContext } from "react";
import { Button, Checkbox, TextField, CircularProgress } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UserContext from "../../UserContext";

import "./FormStyling.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const req = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const res = await req.json();
    if (req.status === 200) {
      console.log(res);
      setUser({
        email: res.email,
        avatar: res.avatar,
        username: res.username,
        id: res.id,
        _id: res.id,
      });
      navigate("/");
    } else {
      setError(res.msg);
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
      <h2 style={{ color: "black", fontWeight: "900" }}>Login</h2>

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
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ paddingBottom: "20px", display: "flex" }}>
            <TextField
              required
              className="outlined-basic-login"
              type="email"
              label="Email"
              variant="outlined"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            <TextField
              required
              className="outlined-basic-login"
              type="password"
              label="Password"
              variant="outlined"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
        </div>
        <div style={{ margin: "20px" }}>
          <FormControlLabel label="Remember me" control={<Checkbox />} />
        </div>
        <div>
          {error.length > 0 && !loading && (
            <p className="err-msg">
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

export default LoginForm;
