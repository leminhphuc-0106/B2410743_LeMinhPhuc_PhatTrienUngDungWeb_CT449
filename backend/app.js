const express = require("express");
const cors = require("cors");

const ApiError = require("./app/api_error");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the library!" });
});

const readerRouter = require("./app/routes/reader.route");
const staffRouter = require("./app/routes/staff.route");
const bookRouter = require("./app/routes/book.route");
const authorRouter = require("./app/routes/author.route");
const categoryRouter = require("./app/routes/category.route");
const publisherRouter = require("./app/routes/publisher.route");
const borrowRouter = require("./app/routes/borrow.route");
const commentRouter = require("./app/routes/comment.route");
const fineRouter = require("./app/routes/fine.route");
const dashboardRouter = require("./app/routes/dashboard.route");

app.use("/api/readers", readerRouter);
app.use("/api/employees", staffRouter);
app.use("/api/books", bookRouter);
app.use("/api/authors", authorRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/publishers", publisherRouter);
app.use("/api/borrowings", borrowRouter);
app.use("/api/reviews", commentRouter);
app.use("/api/fines", fineRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((req, res, next) => {
  return next(new ApiError(404, "Không tìm thấy tài nguyên!"));
});

app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Lỗi máy chủ nội bộ",
  });
});

module.exports = app;
