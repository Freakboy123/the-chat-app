import React, { useContext } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import stringAvatar from "./nameToAvatar";
import { useNavigate, Navigate } from "react-router-dom";
import UserContext from "../../UserContext";

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const handleProfileClick = () => navigate("/profile");
  const handleLogoutClick = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then(() => {
      navigate("login");
      setUser(false);
    });
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div className="headerContainer">
      <h1 style={{ color: "#36d692" }}>The Chat App</h1>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button style={{ borderRadius: "100%" }} onClick={handleClick}>
          <Avatar {...stringAvatar(user.username)} />
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem style={{ fontSize: 12 }} onClick={handleProfileClick}>
            Profile
          </MenuItem>
          <MenuItem style={{ fontSize: 12 }} onClick={handleLogoutClick}>
            Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Header;
