import React, { useRef, useState, useContext, useEffect } from "react";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import "./OpenedChat.css";
import OpenedChatContext from "./OpenedChatContext";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { socket } from "./Home";
import UserContext from "../../UserContext";
import ContactsContext from "./ContactsContext";

const ChatFooter = () => {
  const { currentOpened, setCurrentOpened } = useContext(OpenedChatContext);
  const { contacts, setContacts } = useContext(ContactsContext);
  const { user } = useContext(UserContext);
  const inputElement = useRef();
  const [msg, setMsg] = useState("");
  useEffect(() => {}, [currentOpened]);
  const handleEnterKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit();
    }
  };
  const handleSubmit = async () => {
    if (msg.trim().length) {
      const newMsg = {
        msg: msg,
        recipient: currentOpened.conversationWith.id, // who receives the msg
        read: false,
        date: new Date(Date.now()).toISOString(),
      };
      setCurrentOpened({
        _id: currentOpened._id,
        conversationWith: currentOpened.conversationWith,
        msgHistory: [...currentOpened.msgHistory, newMsg],
      });
      const req = await fetch("/api/home/addMessage", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMsg),
      });
      socket.emit("sendMessage", {
        msg: newMsg,
        user: user,
        socketID: socket.id,
        receiverId: currentOpened.conversationWith.id,
      });
      if (req.status !== 200) {
        console.log(await req.json());
      }
      fetch("/api/home/contacts")
        .then((req) => req.json())
        .then((data) => {
          const sortedContacts = data.sort((a, b) => {
            return new Date(a.lastMsg.date).getTime() >
              new Date(b.lastMsg.date).getTime()
              ? -1
              : 1;
          });
          setContacts(sortedContacts);
        });
    }

    setMsg("");
  };
  function keyDown(element) {
    element.style.height = "1px";
    element.style.height = 15 + element.scrollHeight - 19 + "px";
  }

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      <div
        style={{
          flex: "1",
          display: "flex",
          border: "solid 1.5px",
          borderRadius: "10px",
          borderColor: "black",
          padding: "8px",
          alignItems: "center",
        }}
      >
        <textarea
          ref={inputElement}
          onKeyDown={handleEnterKeyDown}
          onKeyUp={() => {
            keyDown(inputElement.current);
          }}
          value={msg}
          onChange={(e) => {
            setMsg(e.target.value);
          }}
          placeholder="Type your message"
          className="chatInput"
          style={{
            minHeight: "15px",
            border: "none",
            flex: "1",
            background: "transparent",
            resize: "none",
            maxHeight: "90px",
          }}
          rows="1"
        />

        <input
          style={{
            display: "none",
          }}
          accept=".png" // specify the file type that you wanted to accept
          id="choose-file"
          type="file"
        />
        <label htmlFor="choose-file">
          <IconButton aria-label="upload">
            <AttachFileIcon />
          </IconButton>
        </label>
      </div>
      <IconButton onClick={handleSubmit}>
        <SendIcon />
      </IconButton>
    </div>
  );
};

export default ChatFooter;
