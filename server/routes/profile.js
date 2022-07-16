const express = require("express");
const jwtMiddleware = require("./jwtMiddleware");
const route = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Schemas/User");
const jwt = require("jsonwebtoken");

const signToken = (data, exp) => {
  return new Promise((resolve, reject) => {
    // Sign token
    jwt.sign(
      { ...data, exp },
      process.env.privateKey,
      {
        algorithm: "HS256",
      },
      function (err, token) {
        if (err) {
          console.log("err");
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
};

route.get("/myInfo", jwtMiddleware, (req, res) => {
  res.send(req.user);
});

route.put("/changeProfile", jwtMiddleware, async (req, res) => {
  const newData = req.body;
  const userExists = await User.findOne({
    $or: [
      {
        email: newData.email,
      },
      { username: newData.username },
    ],
  }).exec();
  if (userExists) {
    if (userExists.email === newData.email)
      return res.status(400).send({ msg: "Email already taken." });
    else if (userExists.username === newData.username)
      return res.status(400).send({ msg: "Username already taken." });
  }
  if (newData.email && newData.email.trim().length) {
    req.user.email = newData.email;
  }
  if (newData.username && newData.username.trim().length) {
    req.user.username = newData.username.trim();
  }
  if (newData.password && newData.password.trim().length) {
    const hashedPassword = await bcrypt.hash(newData.password, 10);
    req.user.password = hashedPassword;
  }
  const savedUser = await req.user.save();
  const token = await signToken(
    { id: savedUser.id, email: savedUser.email, username: savedUser.username },
    Math.floor(Date.now() / 1000) + 2419200.0
  );
  res.send({ token, user: savedUser });
});

module.exports = route;
