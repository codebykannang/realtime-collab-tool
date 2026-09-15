const User = require("../models/User");
const Card = require("../models/Card");
const List = require("../models/List");
const { invalidateBoardCache } = require("../controllers/boardController");

module.exports = function registerBoardHandlers(io, socket, boardPresence) {
  // Join a board room -> broadcast presence (who's viewing/editing this board right now)
  socket.on("board:join", async ({ boardId }) => {
    socket.join(`board:${boardId}`);

    const user = await User.findById(socket.userId).select("name avatarColor");
    if (!boardPresence.has(boardId)) boardPresence.set(boardId, new Set());
    const users = boardPresence.get(boardId);
    users.add({
      userId: socket.userId,
      name: user?.name || "Unknown",
      color: user?.avatarColor || "#888",
      socketId: socket.id,
    });

    io.to(`board:${boardId}`).emit("presence:update", Array.from(users));
  });

  socket.on("board:leave", ({ boardId }) => {
    socket.leave(`board:${boardId}`);
    const users = boardPresence.get(boardId);
    if (users) {
      for (const entry of users) {
        if (entry.socketId === socket.id) users.delete(entry);
      }
      io.to(`board:${boardId}`).emit("presence:update", Array.from(users));
    }
  });

  // Live cursor broadcast (lightweight - not persisted)
  socket.on("board:cursor", ({ boardId, x, y, name, color }) => {
    socket.to(`board:${boardId}`).emit("board:cursor", { userId: socket.userId, x, y, name, color });
  });

  // --- List operations ---
  socket.on("list:create", async ({ boardId, title }) => {
    const count = await List.countDocuments({ board: boardId });
    const list = await List.create({ title, board: boardId, position: count });
    await invalidateBoardCache(boardId);
    io.to(`board:${boardId}`).emit("list:created", list);
  });

  socket.on("list:reorder", async ({ boardId, orderedListIds }) => {
    await Promise.all(
      orderedListIds.map((id, idx) => List.findByIdAndUpdate(id, { position: idx }))
    );
    await invalidateBoardCache(boardId);
    socket.to(`board:${boardId}`).emit("list:reordered", { orderedListIds });
  });

  // --- Card operations: create / move / update, broadcast instantly to the room ---
  socket.on("card:create", async ({ boardId, listId, title }) => {
    const count = await Card.countDocuments({ list: listId });
    const card = await Card.create({ title, list: listId, board: boardId, position: count });
    await invalidateBoardCache(boardId);
    io.to(`board:${boardId}`).emit("card:created", card);
  });

  // Drag-and-drop move: update list + position, notify everyone else immediately (optimistic UI on sender)
  socket.on("card:move", async ({ boardId, cardId, toListId, toPosition }) => {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { list: toListId, position: toPosition },
      { new: true }
    );
    await invalidateBoardCache(boardId);
    socket.to(`board:${boardId}`).emit("card:moved", { cardId, toListId, toPosition, card });
  });

  socket.on("card:update", async ({ boardId, cardId, changes }) => {
    const card = await Card.findByIdAndUpdate(cardId, changes, { new: true });
    await invalidateBoardCache(boardId);
    socket.to(`board:${boardId}`).emit("card:updated", { cardId, changes, card });
  });

  // Editing lock: prevents two people from typing into the same card description at once
  socket.on("card:lock", async ({ boardId, cardId }) => {
    await Card.findByIdAndUpdate(cardId, { lockedBy: socket.userId });
    socket.to(`board:${boardId}`).emit("card:locked", { cardId, userId: socket.userId });
  });

  socket.on("card:unlock", async ({ boardId, cardId }) => {
    await Card.findByIdAndUpdate(cardId, { lockedBy: null });
    socket.to(`board:${boardId}`).emit("card:unlocked", { cardId });
  });
};
