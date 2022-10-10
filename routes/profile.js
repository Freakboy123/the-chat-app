const express = require("express");
const jwtMiddleware = require("./jwtMiddleware");
const route = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Schemas/User");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");

const checkPassword = (data, res) => {
  if (data.password.length < 6) {
    return res.status(400).json({
      msg: "Your password needs a minimum of 6 characters, uppercase and lowercase letters and at least a number",
    });
  }
  if (!/[A-Z]/.test(data.password)) {
    return res.status(400).json({
      msg: "Your password needs a minimum of 6 characters, uppercase and lowercase letters and at least a number",
    });
  }
  if (!/[0-9]/.test(data.password)) {
    return res.status(400).json({
      msg: "Your password needs a minimum of 6 characters, uppercase and lowercase letters and at least a number",
    });
  }
  if (!/[a-z]/.test(data.password)) {
    return res.status(400).json({
      msg: "Your password needs a minimum of 6 characters, uppercase and lowercase letters and at least a number",
    });
  }
};

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
  try {
    const newData = req.body;
    const userExists = await User.findOne({
      username: newData.username,
    }).exec();
    if (userExists) {
      if (
        userExists.username === newData.username &&
        userExists._id.toString() !== req.user.id.toString()
      )
        return res.status(400).send({ msg: "Username already taken." });
    }
    if (!newData.username.length) {
      return res.status(400).send({ msg: "Username not valid" });
    }
    if (newData.password !== newData.confirmPassword) {
      return res
        .status(400)
        .send({ msg: "Password and confirm password don't match" });
    }
    if (newData.username.length > 20) {
      return res
        .status(400)
        .send({ msg: "Username length has to be shorter than 20" });
    }
    checkPassword(newData, res);
    if (newData.username && newData.username.trim().length) {
      req.user.username = newData.username.trim();
    }
    if (newData.password && newData.password.trim().length) {
      const hashedPassword = await bcrypt.hash(newData.password, 10);
      req.user.password = hashedPassword;
    }
    const savedUser = await req.user.save();
    const token = await signToken(
      {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
      },
      Math.floor(Date.now() / 1000) + 2419200.0
    );
    res.cookie("token", token, {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: "strict",
      expires: dayjs().add(30, "days").toDate(),
    });
    return res.send(savedUser);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = route;
