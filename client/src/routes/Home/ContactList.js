import React, { useEffect, useState, useContext } from "react";
import "./ContactList.css";
import Avatar from "@mui/material/Avatar";
import stringAvatar from "./nameToAvatar";
import OpenedChatContext from "./OpenedChatContext";
import UserContext from "../../UserContext";
import ContactsContext from "./ContactsContext";
import FilterSearchBar from "./FilterSearchBar";

const fetchConversation = (contact) => {
  return new Promise(async (resolve, reject) => {
    const req = await fetch(`/api/home/conversations/${contact._id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const res = await req.json();
    resolve(res);
  });
};

const getConversationWith = (data, user) => {
  return new Promise(async (resolve, reject) => {
    const conversationWith = {};
    for (let id of data.users) {
      if (id !== user.id) {
        conversationWith.id = id;
        const req = await fetch(`/api/home/user/${id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        if (req.status === 200) {
          const res = await req.json();
          conversationWith._id = res._id;
          conversationWith.username = res.username;
          conversationWith.email = res.email;
          conversationWith.avatar = res.avatar;
        }
        resolve(conversationWith);
      }
    }
  });
};

const Contact = ({ contact, handleDrawerToggle }) => {
  const { currentOpened, setCurrentOpened } = useContext(OpenedChatContext);
  const { user } = useContext(UserContext);

  return (
    <div
      className="contact"
      onClick={async () => {
        if (
          true
          // Object.keys(currentOpened).length === 0 ||
          // currentOpened.conversationWith.id !== contact._id
        ) {
          const data = await fetchConversation(contact);
          const conversationWith = await getConversationWith(data, user);
          console.log(data);
          const conversationObj = {
            id: data._id,
            conversationWith,
            msgHistory: data.msgHistory,
          };
          setCurrentOpened(conversationObj);
          handleDrawerToggle();
        }
      }}
    >
      {contact.avatar ? (
        <Avatar alt={contact.username} src={contact.avatar} />
      ) : (
        <Avatar {...stringAvatar(contact.username)} />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          padding: 10,
        }}
      >
        <span style={{ fontWeight: !contact.unread ? "300" : "700" }}>
          {contact.username}
        </span>
        <span
          style={{
            fontSize: 12,
            opacity: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: contact.unread ? "bold" : "200",
          }}
        >
          {contact.lastMsg.msg}
          {/* {contact.lastMsg.date} */}
        </span>
      </div>
      {contact.unread > 0 && (
        <div
          style={{
            backgroundColor: "#de3a2f",
            borderRadius: "40%",
            fontSize: "10px",
            padding: "10px",
            color: "white",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span>{contact.unread}</span>
        </div>
      )}
    </div>
  );
};

const ContactList = ({ handleDrawerToggle }) => {
  const { contacts, setContacts } = useContext(ContactsContext);
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { currentOpened, setCurrentOpened } = useContext(OpenedChatContext);
  const { user } = useContext(UserContext);

  const handleSearchResultClick = (contact) => {
    const setNewConversation = async (contact) => {
      const conversationObj = {
        conversationWith: {
          id: contact._id,
          username: contact.username,
          email: contact.email,
          avatar: contact.avatar,
        },
        msgHistory: [],
      };
      setCurrentOpened(conversationObj);
    };
    const setConversation = async (contact) => {
      if (
        Object.keys(currentOpened).length === 0 ||
        currentOpened.conversationWith.id !== contact._id
      ) {
        const data = await fetchConversation(contact);
        const conversationWith = await getConversationWith(data, user);
        const conversationObj = {
          id: data._id,
          conversationWith,
          msgHistory: data.msgHistory,
        };
        setCurrentOpened(conversationObj);
        handleDrawerToggle();
      }
    };
    for (let i = 0; i < contacts.length; i++) {
      if (contact._id === contacts[i]._id) {
        console.log(contacts[i], contact);
        setConversation(contact);
        return;
      }
    }
    // setContacts([...contacts, contact]);
    setNewConversation(contact);
  };
  useEffect(() => {
    // Fetch suggestions
    const fetchResults = async () => {
      const req = await fetch(`/api/home/users/${searchValue}`);
      const res = await req.json();
      if (req.status === 200) {
        setSuggestions(res);
      } else if (req.status === 400) {
        setSuggestions([]);
      }
    };
    if (searchValue.length) {
      fetchResults();
    } else {
      setSuggestions([]);
    }
  }, [searchValue]);
  useEffect(() => {
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
  }, []);
  return (
    <div className="listContainer">
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "20px", padding: "10px" }}>
          Your Messages
        </span>
        <FilterSearchBar
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          dropdownOpened={dropdownOpened}
          setDropdownOpened={setDropdownOpened}
          suggestions={suggestions}
          handleSearchResultClick={handleSearchResultClick}
        />
        <hr style={{ width: "400px" }} />
      </div>

      <div style={{ overflowY: "scroll" }}>
        {contacts.map((contact) => {
          return (
            <Contact
              key={contact.id}
              contact={contact}
              handleDrawerToggle={handleDrawerToggle}
            />
          );
        })}
      </div>
    </div>
  );
};
export { fetchConversation, getConversationWith };
export default ContactList;
