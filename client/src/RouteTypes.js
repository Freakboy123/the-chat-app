import React, { useContext } from "react";
import { Route } from "react-router-dom";
import UserContext from "./UserContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  return user ? children : <Navigate to="/login" replace={true} />;
};

const UnprotectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  return !user ? children : <Navigate to="/" replace={true} />;
};

export { ProtectedRoute, UnprotectedRoute };
