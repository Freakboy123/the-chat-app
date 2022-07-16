const jwt = require("jsonwebtoken");
const User = require("../Schemas/User");

// middleware
const verifyToken = (req, res, next) => {
  console.log();
  try {
    jwt.verify(
      req.cookies.token,
      process.env.privateKey,
      async function (err, decoded) {
        if (err) {
          res.clearCookie("token");
          return res.status(401).json(err);
        } else {
          const user = await User.findOne({
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
          }).exec();
          if (user) {
            req.user = user;
            console.log(req.user);
            next();
          } else {
            res.clearCookie("token");
            return res.status(401).send({ msg: "Invalid user" });
          }
        }
      }
    );
  } catch (err) {
    res.clearCookie("token");
    console.log(err);
  }
};

module.exports = verifyToken;
