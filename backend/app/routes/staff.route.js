const express = require("express");
const staffController = require("../controllers/staff.controller");

const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyStaff = require("../middlewares/verifyStaff");

const router = express.Router();

// Đăng nhập
router.post("/login", staffController.login);

// Tạo tài khoản nhân viên
router.post("/register", verifyToken, verifyAdmin, staffController.register);

// Xem profile
router.get("/profile", verifyToken, verifyStaff, staffController.getProfile);

// Lấy danh sách nhân viên
router.get("/", verifyToken, verifyAdmin, staffController.getAll);

// Lấy nhân viên theo ID
router.get("/:id", verifyToken, verifyAdmin, staffController.getById);

// Cập nhật thông tin nhân viên
router.put("/:id", verifyToken, verifyStaff, staffController.update);

// Xóa nhân viên
router.delete("/:id", verifyToken, verifyAdmin, staffController.deleteById);

module.exports = router;