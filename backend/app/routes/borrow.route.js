const express = require("express");
const borrowController = require("../controllers/borrow.controller");

const router = express.Router();

router.get("/reader/:MaDocGia", borrowController.findByReader);

router.get("/", borrowController.findAll);
router.post("/", borrowController.create);

router.get("/:id", borrowController.findOne);
router.put("/:id", borrowController.update);
router.put("/:id/return", borrowController.returnBook);
router.delete("/:id", borrowController.delete);

module.exports = router;
