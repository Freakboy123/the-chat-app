import React, { useEffect, useState, useContext, useRef } from "react";
import "./OpenedChat.css";
import stringAvatar from "./nameToAvatar";
import { Avatar } from "@mui/material";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import { socket } from "./Home";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import OpenedChatContext from "./OpenedChatContext";
import UserContext from "../../UserContext";
import { fetchConversation, getConversationWith } from "./ContactList";
import ContactsContext from "./ContactsContext";

const Message = ({ msgData, currentOpened, idx }) => {
  const { user } = useContext(UserContext);
  const date = new Date(msgData.date);
  if (msgData.recipient === user.id) {
    // user receiving a msg
    return (
      <div
        style={{ display: "flex", marginTop: idx === 0 ? 0 : 20 }}
        key={msgData.id}
      >
        <Avatar
          {...stringAvatar(currentOpened.conversationWith.username)}
          style={{
            height: 20,
            width: "20px",
            fontSize: 10,
            alignSelf: "flex-end",
            marginRight: "5px",
          }}
        />
        <div className="msgReceived">
          <span className="msg">{msgData.msg}</span>
          <span
            style={{
              paddingLeft: 10,
              opacity: "60%",
              fontSize: 10,
              fontStyle: "italic",
            }}
          >
            {date.getHours()}:
            {date.getMinutes().toString().length === 1
              ? `0${date.getMinutes()}`
              : date.getMinutes()}
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="msgSent" style={{ marginLeft: "25px" }} key={msgData.id}>
        <span className="msg">{msgData.msg}</span>
        <span
          style={{
            paddingLeft: 10,
            opacity: "60%",
            fontSize: 10,
            fontStyle: "italic",
          }}
        >
          {date.getHours()}:
          {date.getMinutes().toString().length === 1
            ? `0${date.getMinutes()}`
            : date.getMinutes()}
        </span>
      </div>
    );
  }
};

const sortMsg = (msgHistory) => {
  return [...msgHistory].sort((a, b) =>
    new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1
  );
};

const OpenedChat = ({ handleDrawerToggle }) => {
  const { currentOpened, setCurrentOpened } = useContext(OpenedChatContext);
  const { user } = useContext(UserContext);
  const [payload, setPayload] = useState(null);
  const { contacts, setContacts } = useContext(ContactsContext);
  const readMsg = async () => {
    const req = await fetch("/api/home/readConversations", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currentOpened.conversationWith.id,
      }),
    });
    const res = await req.json();
    if (req.status === 200) {
      setCurrentOpened({
        id: currentOpened.id,
        conversationWith: currentOpened.conversationWith,
        msgHistory: res,
      });
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
  };
  const handleReceiveMsg = async (payload) => {
    const contact = payload.user;
    console.log("HELLO!", currentOpened);
    if (
      Object.keys(currentOpened).length === 0 ||
      currentOpened.conversationWith.id === contact.id
    ) {
      const data = await fetchConversation(contact);
      const conversationWith = await getConversationWith(data, user);

      const conversationObj = {
        id: data._id,
        conversationWith,
        msgHistory: data.msgHistory,
      };
      setCurrentOpened(conversationObj);
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
  };
  useEffect(() => {
    console.log("OUTSIDE", currentOpened);
    socket.on("receiveMessage", (payload) => {
      setPayload(payload);
    });
  }, [socket]);
  useEffect(() => {
    console.log("PAYLOAD", payload);
    handleReceiveMsg(payload);
  }, [payload]);
  useEffect(() => {
    if (Object.keys(currentOpened).length !== 0) {
      if (
        currentOpened.msgHistory.length &&
        !currentOpened.msgHistory[currentOpened.msgHistory.length - 1].read &&
        currentOpened.msgHistory[currentOpened.msgHistory.length - 1]
          .recipient === user.id
      ) {
        setTimeout(() => {
          readMsg();
        }, 1500);
      }
    }
  }, [currentOpened]);
  const chatContainer = useRef();
  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [currentOpened]);

  const sortedMsgHistory =
    Object.keys(currentOpened).length !== 0
      ? sortMsg(currentOpened.msgHistory)
      : [];
  if (!currentOpened || Object.keys(currentOpened).length === 0) {
    return (
      <div className="openedContainer openedEmptyContainer">
        <div style={{ width: "100%" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            // edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { xs: "block", sm: "block", md: "none" },
              float: "left",
            }}
            style={{ float: "left" }}
          >
            <MenuIcon />
          </IconButton>
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",

            justifyContent: "center",
            alignItems: "center",
            flex: "1",
          }}
        >
          <h2>No Opened Chats</h2>
          <br />
          <p>Open a conversation to start chatting!</p>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="openedContainer openedChatContainer"
        style={{ flex: "1" }}
      >
        <ChatHeader
          conversationWith={currentOpened.conversationWith}
          handleDrawerToggle={handleDrawerToggle}
        />
        <div className="chats" ref={chatContainer}>
          {sortedMsgHistory.map((msgData, idx) => {
            const date = new Date(msgData.date);
            if (idx === 0) {
              return (
                <div
                  style={{ display: "flex", flexDirection: "column" }}
                  key={msgData._id}
                >
                  {!msgData.read && msgData.recipient === user.id && (
                    <p
                      style={{
                        textAlign: "center",
                        backgroundColor: "#f0e7b4",
                        color: "#787772",
                      }}
                    >
                      Unread messages
                    </p>
                  )}
                  <p className="msgDate">{date.toDateString()}</p>
                  <Message
                    msgData={msgData}
                    currentOpened={currentOpened}
                    idx={idx}
                    key={msgData.id}
                  />
                </div>
              );
            } else if (
              date.toDateString() !==
              new Date(currentOpened.msgHistory[idx - 1].date).toDateString()
            ) {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingTop: "20px",
                  }}
                  key={msgData._id}
                >
                  {!msgData.read &&
                    ((sortedMsgHistory[idx - 1].read &&
                      sortedMsgHistory[idx - 1].recipient === user.id) ||
                      sortedMsgHistory[idx - 1].recipient !== user.id) &&
                    msgData.recipient === user.id && (
                      <p
                        style={{
                          textAlign: "center",
                          backgroundColor: "#f0e7b4",
                          color: "#787772",
                        }}
                      >
                        Unread messages
                      </p>
                    )}
                  <span className="msgDate">{date.toDateString()}</span>
                  <Message
                    msgData={msgData}
                    currentOpened={currentOpened}
                    idx={idx}
                    key={msgData.id}
                  />
                </div>
              );
            } else {
              return (
                <>
                  {!msgData.read &&
                    ((sortedMsgHistory[idx - 1].read &&
                      sortedMsgHistory[idx - 1].recipient === user.id) ||
                      sortedMsgHistory[idx - 1].recipient !== user.id) &&
                    msgData.recipient === user.id && (
                      <p
                        style={{
                          textAlign: "center",
                          backgroundColor: "#f0e7b4",
                          color: "#787772",
                        }}
                      >
                        Unread messages
                      </p>
                    )}
                  <Message
                    msgData={msgData}
                    currentOpened={currentOpened}
                    idx={idx}
                    key={msgData.id}
                  />
                </>
              );
            }
          })}
        </div>
        <ChatFooter />
      </div>
    );
  }
};

export default OpenedChat;
