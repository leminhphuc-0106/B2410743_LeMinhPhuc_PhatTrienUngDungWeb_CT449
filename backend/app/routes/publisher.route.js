const express = require("express");
const publisherController = require("../controllers/publisher.controller");

const router = express.Router();

router.get("/search/:name", publisherController.findByName);

router.get("/", publisherController.findAll);
router.post("/", publisherController.create);
router.delete("/", publisherController.deleteAll);

router.get("/:id", publisherController.findById);
router.put("/:id", publisherController.update);
router.delete("/:id", publisherController.delete);

module.exports = router;
