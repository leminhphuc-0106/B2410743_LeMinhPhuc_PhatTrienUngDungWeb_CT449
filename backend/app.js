const express = require("express");
const cors = require("cors");

const app = express();

const ApiError = require("./app/api_error");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the library!" });
});

const readerRouter = require("./app/routes/reader.route");
const staffRouter = require("./app/routes/staff.route")

app.use("/api/reader", readerRouter);
app.use("/api/staff", staffRouter)
module.exports = app;

