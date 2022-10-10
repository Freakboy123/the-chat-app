const express = require("express");
const router = express.Router();
const User = require("../Schemas/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const jwtMiddleware = require("./jwtMiddleware");

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

router.post("/signup", async (req, res) => {
  const data = req.body;
  console.log(data);
  try {
    const query = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    }).exec();
    if (!query) {
      // User does not exist
      // Check password
      const passwordsMatch = data.password === data.confirmPassword;
      if (!passwordsMatch) {
        return res
          .status(400)
          .json({ msg: "Password and confirm password don't match" });
      }
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

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = new User({
        email: data.email,
        avatar: data.avatar,
        username: data.username,
        password: hashedPassword,
      });
      const userSaved = await newUser.save();

      const token = await signToken(
        {
          id: userSaved.id,
          email: userSaved.email,
          username: userSaved.username,
        },
        Math.floor(Date.now() / 1000) + 2419200.0
      ); // 28 days exp
      res.cookie("token", token, {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        sameSite: "strict",
        expires: dayjs().add(30, "days").toDate(),
      });
      res.json({
        email: userSaved.email,
        id: userSaved.id,
        username: userSaved.username,
      });
    } else if (query.email === data.email)
      return res.status(400).json({
        msg: "Account with this email already exists. Use another email.",
      });
    else if (query.username === data.username)
      return res.status(400).json({
        msg: "Account with this username already exists. Use another username.",
      });
    else {
      return res.send({ success: false, query });
    }
  } catch (err) {
    return res.status(500).json({ err });
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email: email }).exec();
    if (foundUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        foundUser.password
      );
      if (isPasswordValid) {
        const token = await signToken(
          {
            id: foundUser.id,
            email: foundUser.email,
            username: foundUser.username,
          },
          Math.floor(Date.now() / 1000) + 2419200.0
        ); // 28 days exp
        res.cookie("token", token, {
          secure: process.env.NODE_ENV !== "development",
          httpOnly: true,
          sameSite: "strict",
          expires: dayjs().add(30, "days").toDate(),
        });
        res.json({
          token,
          email: foundUser.email,
          id: foundUser.id,
          username: foundUser.username,
        });
      } else {
        res.status(400).json({ msg: "Wrong email/password" });
      }
    } else {
      res.status(400).json({ msg: "Wrong email/password" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/logout", jwtMiddleware, (req, res) => {
  res.clearCookie("token");
  res.end();
});

module.exports = router;
