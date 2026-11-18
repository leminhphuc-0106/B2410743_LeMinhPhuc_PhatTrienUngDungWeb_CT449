const express = require("express");
const authorController = require("../controllers/author.controller");

const router = express.Router();

router.get("/search/:name", authorController.findByName);
router.get("/query", authorController.find);

router.get("/", authorController.getAll);
router.post("/", authorController.create);
router.delete("/", authorController.deleteAll);

router.get("/:id", authorController.findById);
router.put("/:id", authorController.update);
router.delete("/:id", authorController.deleteById);

module.exports = router;
