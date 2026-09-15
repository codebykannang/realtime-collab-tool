const Board = require("../models/Board");

// Debounced persistence: we don't hit Mongo on every single point, only on stroke completion.
module.exports = function registerWhiteboardHandlers(io, socket) {
  socket.on("whiteboard:join", ({ boardId }) => {
    socket.join(`whiteboard:${boardId}`);
  });

  // Fired continuously while the user drags the pointer - broadcast only, no DB write.
  socket.on("whiteboard:draw", ({ boardId, stroke }) => {
    socket.to(`whiteboard:${boardId}`).emit("whiteboard:draw", stroke);
  });

  // Fired once when the user lifts the pen - persist the finished stroke.
  socket.on("whiteboard:stroke:end", async ({ boardId, stroke }) => {
    await Board.findByIdAndUpdate(boardId, { $push: { whiteboardStrokes: stroke } });
    socket.to(`whiteboard:${boardId}`).emit("whiteboard:stroke:end", stroke);
  });

  socket.on("whiteboard:clear", async ({ boardId }) => {
    await Board.findByIdAndUpdate(boardId, { whiteboardStrokes: [] });
    io.to(`whiteboard:${boardId}`).emit("whiteboard:clear");
  });

  socket.on("whiteboard:undo", async ({ boardId }) => {
    const board = await Board.findById(boardId);
    if (board && board.whiteboardStrokes.length > 0) {
      board.whiteboardStrokes.pop();
      await board.save();
      io.to(`whiteboard:${boardId}`).emit("whiteboard:sync", board.whiteboardStrokes);
    }
  });
};
