import React, { useState, useContext, createContext } from "react";
import "./Login.css";
import Header from "./Header";
import LoginForm from "./LoginForm";
import SignupForm from "./SignUpForm";
import { useLocation } from "react-router-dom";

const Auth = () => {
  const location = useLocation();
  const [loginPage, setLoginPage] = useState(true);
  return (
    <div className="parent">
      <Header />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <p style={{ fontWeight: 300, fontSize: "20px" }}>
          Welcome to the Chat App!
        </p>
      </div>
      {location.pathname.includes("/login") ? <LoginForm /> : <SignupForm />}
    </div>
  );
};

export default Auth;
