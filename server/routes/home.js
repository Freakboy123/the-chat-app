const express = require("express");
const router = express.Router();
const User = require("../Schemas/User");
const Conversation = require("../Schemas/Conversation");
const mongoose = require("mongoose");

const jwtMiddleware = require("./jwtMiddleware");

router.get("/contacts", jwtMiddleware, async (req, res) => {
  try {
    const contacts = [...req.user.contacts];
    let i = 0;
    for (const id of contacts) {
      const contact = await User.findById(id).exec();

      if (contact) {
        const conversation = await Conversation.findOne({
          users: { $all: [contact.id, req.user.id] },
        });
        console.log(conversation);
        const countUnread = (conv) => {
          const unreadConvs = conv.msgHistory.filter((x) => {
            if (x.recipient.toString() === req.user.id.toString()) {
              return !x.read;
            }
          });
          return unreadConvs.length;
        };
        const unreads = countUnread(conversation);

        contacts[i] = {
          id: contact.id,
          username: contact.username,
          avatar: contact.avatar,
          lastMsg:
            conversation.msgHistory[conversation.msgHistory.length - 1] || null,
          unread: unreads,
        };
        i++;
      } else {
        return;
      }
    }
    return res.send(contacts);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.put("/addContact", jwtMiddleware, async (req, res) => {
  try {
    const query = req.body; // Object id
    const newContact = await User.findById(query.id).exec();
    if (newContact) {
      if (newContact.email === req.user.email) {
        return res.status(400).send({ msg: "Contact cannot be self." });
      }
      // add contact for each other
      const updateContacts = (user, newContact) => {
        // Check for duplicate
        for (let i = 0; i < user.contacts.length; i++) {
          if (newContact.id === user.contacts[i].toString()) {
            // Duplicate found
            return res.status(400).send({ msg: "Contact already exists" });
          }
        }
        user.contacts.push(newContact.id);
        user.save();
        newContact.contacts.push(user.id);
        newContact.save();
        return res.send({
          email: user.email,
          username: user.username,
          id: user.id,
        });
      };
      updateContacts(req.user, newContact);
    } else {
      return res.status(400).send({ msg: "User not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/createConversation", jwtMiddleware, async (req, res) => {
  const query = await Conversation.findOne({
    users: { $all: [req.user.id, req.body.id] },
  });

  if (!query) {
    // Check if conversation started
    const queryUser = req.body.id;
    for (let i = 0; i < req.user.contacts.length; i++) {
      console.log(req.user.contacts[i].toString());
      if (queryUser === req.user.contacts[i].toString()) {
        const newConversation = new Conversation({
          users: [req.body.id, req.user.id],
          msgHistory: req.body.msgHistory || {},
        });
        const savedConversation = await newConversation.save();
        console.log(savedConversation);
        return res.json(savedConversation);
      }
    }
    return res.status(400).send({ msg: "No contact found" });
    // Create conversation
  } else {
    return res.status(400).send({ msg: "Conversation already exists" });
  }
});

router.get("/conversations/:id", jwtMiddleware, async (req, res) => {
  const query = await Conversation.findOne({
    users: { $all: [req.params.id, req.user.id] },
  });

  if (query) {
    // Create conversation
    return res.send(query);
  } else {
    return res.status(400).send({ msg: "No conversations" });
  }
});

router.put("/readConversations", jwtMiddleware, async (req, res) => {
  const conversation = await Conversation.findOne({
    users: { $all: [req.body.id, req.user.id] },
  });
  if (conversation) {
    for (let index = conversation.msgHistory.length - 1; index >= 0; index--) {
      let msg = conversation.msgHistory[index];
      if (msg.recipient.toString() === req.user.id.toString()) {
        msg.read = true;
      }
    }
    conversation.save();
    res.send(conversation.msgHistory);
  } else {
    return res.status(400).send({ msg: "No conversations" });
  }
});

router.put("/addMessage", jwtMiddleware, async (req, res) => {
  const recipient = req.body.recipient;
  // Check if user exists
  const user = await User.findById(recipient);
  if (user && recipient !== req.user.id.toString()) {
    const conversation = await Conversation.findOne({
      users: { $all: [req.body.recipient, req.user.id] },
    });
    if (conversation) {
      conversation.msgHistory.push(req.body);
      const saved = await conversation.save();
      res.send(saved);
    } else {
      return res.status(400).send({ msg: "No conversation" });
    }
  } else {
    return res.status(400).send({ msg: "No user" });
  }
});

router.get("/users", jwtMiddleware, async (req, res) => {
  try {
    const users = await User.find(
      {
        username: { $nin: req.user.username },
        email: { $nin: req.user.email },
        $or: [
          { username: new RegExp(`${req.body.query}`, "i") },
          { email: new RegExp(`${req.body.query}`, "i") },
        ],
      },
      { password: 0, contacts: 0 }
    )
      .limit(5)
      .exec();
    if (users.length) res.send(users);
    else res.status(400).send({ msg: "No users" });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/user/:id", jwtMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, {
      password: 0,
      contacts: 0,
    }).exec();
    if (user) res.send(user);
    else res.status(400).send({ msg: "No user" });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
