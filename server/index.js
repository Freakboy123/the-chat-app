const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const server = require("http").createServer(app);

const socketIo = require("socket.io");

const io = new socketIo.Server(server, {
  cors: {
    origin: "*",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (userId) => {
  users = users.filter((user) => user.userId !== userId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log(socket.id);
  // console.log("USERS", users);
  socket.on("add user", (userId) => {
    addUser(userId, socket.id);
    // console.log("USER ADDED", users);
  });
  socket.on("sendMessage", (payload) => {
    // console.log("USERS", users);
    const user = getUser(payload.receiverId);
    if (socket.connected && user)
      socket.broadcast.emit("receiveMessage", payload);
  });
  socket.on("disconnected", (userId) => {
    removeUser(userId);
    console.log("ENDED", users);
  });
});

// Middleware
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: false })); // Form data
app.use(cookieParser());
var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/home", require("./routes/home"));
app.use("/api/profile", require("./routes/profile"));

//DB Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("Connected to DB");
  } catch (err) {
    console.log(err);
  }
}
connectDB();

// default route
app.get("/api", (req, res) => {
  res.json({ msg: "Hello World!" });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log("Server started PORT", PORT);
});
