const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");
const { cacheClient } = require("../config/redis");

// @route POST /api/boards
exports.createBoard = async (req, res) => {
  try {
    const { title, background } = req.body;
    const board = await Board.create({
      title,
      background,
      owner: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/boards  (boards the user owns or is a member of)
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user._id }).sort({ updatedAt: -1 });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/boards/:id  (full board with lists + cards)
// Cached in Redis for a short TTL to reduce DB load on frequently opened boards.
exports.getBoardDetail = async (req, res) => {
  try {
    const cacheKey = `board:${req.params.id}:detail`;
    const cached = await cacheClient.get(cacheKey).catch(() => null);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const board = await Board.findById(req.params.id).populate("members", "-password");
    if (!board) return res.status(404).json({ message: "Board not found" });

    const lists = await List.find({ board: board._id }).sort({ position: 1 });
    const cards = await Card.find({ board: board._id }).sort({ position: 1 });

    const payload = { board, lists, cards };
    await cacheClient.setEx(cacheKey, 15, JSON.stringify(payload)).catch(() => {});
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/boards/:id/invite  { email }
exports.inviteMember = async (req, res) => {
  const User = require("../models/User");
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!board.members.includes(user._id)) {
      board.members.push(user._id);
      await board.save();
    }
    await cacheClient.del(`board:${board._id}:detail`).catch(() => {});
    res.json({ board, invitedUser: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/boards/:id/lists  { title }
exports.createList = async (req, res) => {
  try {
    const count = await List.countDocuments({ board: req.params.id });
    const list = await List.create({
      title: req.body.title,
      board: req.params.id,
      position: count,
    });
    await cacheClient.del(`board:${req.params.id}:detail`).catch(() => {});
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.invalidateBoardCache = async (boardId) => {
  await cacheClient.del(`board:${boardId}:detail`).catch(() => {});
};
