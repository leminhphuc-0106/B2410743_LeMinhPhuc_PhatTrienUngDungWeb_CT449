const express = require("express");
const fineController = require("../controllers/fine.controller");

const router = express.Router();

router.get("/reader/:MaDocGia", fineController.findByReader);

router.get("/", fineController.findAll);
router.post("/", fineController.create);

router.get("/:id", fineController.findOne);
router.put("/:id", fineController.update);
router.delete("/:id", fineController.delete);

module.exports = router;
