import React from "react";
import stringAvatar from "./nameToAvatar";
import { Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

const ChatHeader = ({ conversationWith, handleDrawerToggle }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        padding: "5px 20px 5px 20px",
        justifyContent: "space-between",
        alignContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        boxShadow:
          "0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 3px 10px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ display: { xs: "block", sm: "block", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            {...stringAvatar(conversationWith.username)}
            style={{ height: "32px", width: "32px", marginRight: "10px" }}
          />
          <p style={{ fontSize: "20px", alignSelf: "center" }}>
            {conversationWith.username}
          </p>
        </div>
      </div>
      <p style={{ fontWeight: "200" }}>{conversationWith.email}</p>
    </div>
  );
};

export default ChatHeader;
