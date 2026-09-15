const User = require("../models/User");
const Notification = require("../models/Notification");

module.exports = function registerChatHandlers(io, socket) {
  socket.on("chat:join", ({ boardId }) => {
    socket.join(`chat:${boardId}`);
  });

  socket.on("chat:typing", ({ boardId, name }) => {
    socket.to(`chat:${boardId}`).emit("chat:typing", { userId: socket.userId, name });
  });

  socket.on("chat:message", async ({ boardId, text, mentions = [] }) => {
    const user = await User.findById(socket.userId).select("name avatarColor");
    const message = {
      id: `${Date.now()}-${socket.userId}`,
      boardId,
      author: { id: socket.userId, name: user?.name, color: user?.avatarColor },
      text,
      createdAt: new Date().toISOString(),
    };

    // Broadcast the chat message instantly to everyone in the board's chat room
    io.to(`chat:${boardId}`).emit("chat:message", message);

    // Create + push notifications for anyone @mentioned
    for (const mentionedUserId of mentions) {
      const notif = await Notification.create({
        recipient: mentionedUserId,
        type: "mentioned",
        message: `${user?.name} mentioned you in a message`,
        board: boardId,
      });
      io.to(`user:${mentionedUserId}`).emit("notification:new", notif);
    }
  });
};
