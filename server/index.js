const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

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
    await console.log("Connected to DB");
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
app.listen(PORT, () => {
  console.log("Server started PORT", PORT);
});
