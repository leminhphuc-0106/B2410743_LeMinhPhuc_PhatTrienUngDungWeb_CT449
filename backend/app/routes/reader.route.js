const express = require("express");
const readerController = require("../controllers/reader.controller");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

// Đăng ký độc giả 
router.post("/register", readerController.register);

// Đăng nhập độc giả
router.post("/login", readerController.login);

// Lấy thông tin độc giả đang đăng nhập
router.get("/profile", verifyToken, readerController.getProfile);

// Lấy danh sách độc giả
router.get("/", verifyToken, readerController.getAll);

// Lấy độc giả theo ID
router.get("/:id", verifyToken, readerController.getById);

// Cập nhật thông tin độc giả
router.put("/:id", verifyToken, readerController.update);

// Xóa độc giả theo ID
router.delete("/:id", verifyToken, readerController.deleteById);

module.exports = router;
