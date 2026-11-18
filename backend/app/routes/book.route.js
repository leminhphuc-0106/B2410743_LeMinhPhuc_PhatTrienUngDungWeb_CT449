const express = require("express");
const bookController = require("../controllers/book.controller");

const router = express.Router();

router.get("/search", bookController.findByTitle);
router.get("/details", bookController.findWithDetails);

router.get("/", bookController.findAll);
router.post("/", bookController.create);
router.delete("/", bookController.deleteAll);

router.get("/:id", bookController.findOne);
router.put("/:id", bookController.update);
router.delete("/:id", bookController.delete);

module.exports = router;
