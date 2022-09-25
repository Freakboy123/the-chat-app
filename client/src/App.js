import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/Home/Home";
import Auth from "./routes/Auth/Auth";
import Profile from "./routes/Profile/Profile";
import StyledEngineProvider from "@mui/material/StyledEngineProvider";
import { ProtectedRoute, UnprotectedRoute } from "./RouteTypes";

import UserContext from "./UserContext";
import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const req = await fetch("/api/profile/myInfo");
      const res = await req.json();
      if (req.status == 200) {
        // User exists and JWT is valid
        setUser({
          email: res.email,
          avatar: res.avatar,
          username: res.username,
          id: res._id,
          _id: res._id,
        });
      }
    };
    checkUser();
  }, []);
  console.log(user);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <StyledEngineProvider injectFirst>
        <BrowserRouter>
          <Routes>
            <Route
              exact
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <UnprotectedRoute>
                  <Auth />
                </UnprotectedRoute>
              }
            />
            <Route
              exact
              path="/signup"
              element={
                <UnprotectedRoute>
                  <Auth />
                </UnprotectedRoute>
              }
            />
            <Route
              exact
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </StyledEngineProvider>
    </UserContext.Provider>
  );
}

const NotFoundPage = () => {
  return <h2>Not Found</h2>;
};

export default App;
