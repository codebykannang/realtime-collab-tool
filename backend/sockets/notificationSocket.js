// Every authenticated socket joins a private room keyed by userId, so the
// server can push notifications to a specific user regardless of which
// board/page they're currently on (this is what the Notification Engine uses).
module.exports = function registerNotificationHandlers(io, socket) {
  socket.join(`user:${socket.userId}`);

  socket.on("notification:ping", () => {
    socket.emit("notification:pong", { ok: true, ts: Date.now() });
  });
};

// Helper other modules can import to push a notification to a user in real time.
module.exports.pushNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit("notification:new", notification);
};
