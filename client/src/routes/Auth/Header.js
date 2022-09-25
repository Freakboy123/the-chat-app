import React, { useContext } from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="headerContainer">
      <h1 style={{ color: "#36d692" }}>The Chat App</h1>
      <div style={{ alignSelf: "center" }}>
        <Button
          className="Button"
          onClick={() => {
            navigate("/login");
          }}
        >
          Login
        </Button>
        <Button
          className="Button"
          onClick={() => {
            navigate("/signup");
          }}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};

export default Header;
