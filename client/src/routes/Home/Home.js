import React, { useState, useContext, useEffect } from "react";
import ContactList from "./ContactList";
import Header from "./Header";
import "./Home.css";
import OpenedChat from "./OpenedChat";
import io from "socket.io-client";
import Drawer from "@mui/material/Drawer";

import OpenedChatContext from "./OpenedChatContext";
import UserContext from "../../UserContext";
import ContactsContext from "./ContactsContext";
import { Box } from "@mui/system";

const socket = io.connect("http://192.168.86.36:5002");

const Home = () => {
  const [currentOpened, setCurrentOpened] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const container =
    window !== undefined ? () => window.document.body : undefined;
  const drawerWidth = 100;

  const { user } = useContext(UserContext);
  useEffect(() => {
    socket.connect();
    socket.emit("add user", user.id);
    console.log("RUNNING", socket.id);
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    return function cleanup() {
      socket.emit("disconnected", user.id);
      console.log("OK", socket.id);

      // socket.emit("disconnect", user.id);
    };
  }, [user]);
  return (
    <OpenedChatContext.Provider value={{ currentOpened, setCurrentOpened }}>
      <ContactsContext.Provider value={{ contacts, setContacts }}>
        <div
          className="homeContainer"
          value={{ currentOpened, setCurrentOpened }}
        >
          <Header />

          <div className="appContainer">
            <Box>
              <Drawer
                container={container}
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                  display: { xs: "block", sm: "block", md: "none" },
                  "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                  },
                }}
                style={{ width: drawerWidth }}
              >
                <ContactList handleDrawerToggle={handleDrawerToggle} />
              </Drawer>
            </Box>
            <Box
              sx={{
                display: { xs: "none", sm: "none", md: "block" },
                height: "100%",
              }}
            >
              <ContactList />
            </Box>
            <OpenedChat handleDrawerToggle={handleDrawerToggle} />
          </div>
        </div>
      </ContactsContext.Provider>
    </OpenedChatContext.Provider>
  );
};

export default Home;
export { socket };
