const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["card_assigned", "comment_added", "mentioned", "board_invite", "card_moved"],
      required: true,
    },
    message: { type: String, required: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
