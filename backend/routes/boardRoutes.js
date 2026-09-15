const express = require("express");
const router = express.Router();
const {
  createBoard,
  getBoards,
  getBoardDetail,
  inviteMember,
  createList,
} = require("../controllers/boardController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", createBoard);
router.get("/", getBoards);
router.get("/:id", getBoardDetail);
router.post("/:id/invite", inviteMember);
router.post("/:id/lists", createList);

module.exports = router;
