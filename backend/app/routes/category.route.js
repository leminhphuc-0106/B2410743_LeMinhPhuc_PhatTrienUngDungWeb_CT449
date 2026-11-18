const express = require("express");
const categoryController = require("../controllers/category.controller");

const router = express.Router();

router.get("/search/:name", categoryController.findByName);

router.get("/", categoryController.findAll);
router.post("/", categoryController.create);
router.delete("/", categoryController.deleteAll);

router.get("/:id", categoryController.findById);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.delete);

module.exports = router;
