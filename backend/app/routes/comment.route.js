const express = require("express");
const commentController = require("../controllers/comment.controller");

const router = express.Router();

router.get("/book/:MaSach", commentController.findByBook);
router.get("/reader/:MaDocGia", commentController.findByReader);

router.get("/", commentController.findAll);
router.post("/", commentController.create);

router.get("/:id", commentController.findOne);
router.put("/:id", commentController.update);
router.delete("/:id", commentController.delete);

module.exports = router;
