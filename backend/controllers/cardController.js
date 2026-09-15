const Card = require("../models/Card");
const { invalidateBoardCache } = require("./boardController");

// @route POST /api/cards  { title, list, board }
exports.createCard = async (req, res) => {
  try {
    const { title, list, board } = req.body;
    const count = await Card.countDocuments({ list });
    const card = await Card.create({ title, list, board, position: count });
    await invalidateBoardCache(board);
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/cards/:id
exports.updateCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return res.status(404).json({ message: "Card not found" });
    await invalidateBoardCache(card.board);
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/cards/:id/comments  { text }
exports.addComment = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    card.comments.push({
      author: req.user._id,
      authorName: req.user.name,
      text: req.body.text,
    });
    await card.save();
    await invalidateBoardCache(card.board);
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/cards/:id
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (card) await invalidateBoardCache(card.board);
    res.json({ message: "Card deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
