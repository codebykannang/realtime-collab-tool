const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { verifySocketToken } = require("../middleware/auth");
const { pubClient, subClient } = require("../config/redis");

const registerBoardHandlers = require("./boardSocket");
const registerWhiteboardHandlers = require("./whiteboardSocket");
const registerChatHandlers = require("./chatSocket");
const registerNotificationHandlers = require("./notificationSocket");

// In-memory presence map, mirrored into Redis so it works across multiple server instances.
// key: boardId -> Set of { userId, name, color, socketId }
const boardPresence = new Map();

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
    // Reasonable defaults for a chat + whiteboard workload
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Redis pub/sub adapter: this is what lets Socket.io broadcast events across
  // multiple horizontally-scaled Node.js instances (the "Redis pub/sub reduces load" requirement).
  io.adapter(createAdapter(pubClient, subClient));

  // JWT auth on the socket handshake
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error: no token"));
      const decoded = verifySocketToken(token);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id} (user ${socket.userId})`);

    registerBoardHandlers(io, socket, boardPresence);
    registerWhiteboardHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerNotificationHandlers(io, socket);

    socket.on("disconnect", () => {
      // Clean up presence entries for every board this socket had joined
      for (const [boardId, users] of boardPresence.entries()) {
        const before = users.size;
        for (const entry of users) {
          if (entry.socketId === socket.id) users.delete(entry);
        }
        if (users.size !== before) {
          io.to(`board:${boardId}`).emit("presence:update", Array.from(users));
        }
      }
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;
