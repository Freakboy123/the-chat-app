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
          _id: contact.id,
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

router.get("/conversations/:id", jwtMiddleware, async (req, res) => {
  try {
    const query = await Conversation.findOne({
      users: { $all: [req.params.id, req.user.id] },
    });

    if (query) {
      return res.send(query);
    } else {
      return res.status(400).send({});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
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
      // Add in contactList
      const updateContacts = (user, newContact) => {
        user.contacts.push(newContact.id);
        user.save();
        newContact.contacts.push(user.id);
        newContact.save();
      };
      updateContacts(req.user, user);
      //Create Conversation
      const newConversation = new Conversation({
        users: [req.body.recipient, req.user._id],
        msgHistory: [
          {
            msg: req.body.msg,
            recipient: user.id,
            read: false,
          },
        ],
      });
      const savedConversation = await newConversation.save();
      return res.json(savedConversation);
    }
  } else {
    return res.status(400).send({ msg: "No user" });
  }
});

router.get("/users/:query", jwtMiddleware, async (req, res) => {
  try {
    const users = await User.find(
      {
        username: { $nin: req.user.username },
        email: { $nin: req.user.email },
        $or: [
          { username: new RegExp(`^${req.params.query}`, "i") },
          { email: new RegExp(`^${req.params.query}`, "i") },
        ],
      },
      { password: 0, contacts: 0 }
    )
      .limit(5)
      .exec();
    if (users.length) {
      const usersToSend = [];
      for (let i = 0; i < users.length; i++) {
        let user = users[i];
        usersToSend.push({
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          id: user._id,
        });
      }
      res.send(users);
    } else res.status(400).send({ msg: "No users" });
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
