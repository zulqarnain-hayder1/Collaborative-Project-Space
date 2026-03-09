const jwt = require("jsonwebtoken");

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-project", (projectId) => {
      socket.join(projectId);
      io.to(projectId).emit("collaboration-users", {
        userId: socket.user.id,
        name: socket.user.name,
        action: "joined",
      });
    });

    socket.on("leave-project", (projectId) => {
      socket.leave(projectId);
      io.to(projectId).emit("collaboration-users", {
        userId: socket.user.id,
        name: socket.user.name,
        action: "left",
      });
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit("collaboration-users", {
            userId: socket.user.id,
            name: socket.user.name,
            action: "left",
          });
        }
      });
    });
  });
};

module.exports = socketHandler;
