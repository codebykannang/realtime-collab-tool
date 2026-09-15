const express = require("express");
const router = express.Router();
const { createCard, updateCard, addComment, deleteCard } = require("../controllers/cardController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", createCard);
router.put("/:id", updateCard);
router.post("/:id/comments", addComment);
router.delete("/:id", deleteCard);

module.exports = router;
