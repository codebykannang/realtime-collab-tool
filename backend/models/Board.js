const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    background: { type: String, default: "#0f172a" },
    // Whiteboard strokes are stored as a flat array of stroke objects for simple persistence.
    // Each stroke: { id, points: [{x,y}], color, width, userId }
    whiteboardStrokes: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema);
