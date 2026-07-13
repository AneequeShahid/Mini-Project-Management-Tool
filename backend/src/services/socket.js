import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: "*" } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    socket.join(`user:${userId}`);
    io.emit("presence:online", { userId });

    socket.on("join:project", (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("leave:project", (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on("task:move", (data) => {
      socket.to(`project:${data.projectId}`).emit("task:moved", data);
    });

    socket.on("task:update", (data) => {
      socket.to(`project:${data.projectId}`).emit("task:updated", data);
    });

    socket.on("task:create", (data) => {
      socket.to(`project:${data.projectId}`).emit("task:created", data);
    });

    socket.on("sprint:update", (data) => {
      socket.to(`project:${data.projectId}`).emit("sprint:updated", data);
    });

    socket.on("comment:add", (data) => {
      socket.to(`project:${data.projectId}`).emit("comment:added", data);
    });

    socket.on("typing:start", (data) => {
      socket.to(`project:${data.projectId}`).emit("typing:started", { userId, userName: data.userName, taskId: data.taskId });
    });

    socket.on("typing:stop", (data) => {
      socket.to(`project:${data.projectId}`).emit("typing:stopped", { userId, taskId: data.taskId });
    });

    socket.on("disconnect", () => {
      io.emit("presence:offline", { userId });
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function emitToProject(projectId, event, data) {
  io?.to(`project:${projectId}`).emit(event, data);
}

export function emitToUser(userId, event, data) {
  io?.to(`user:${userId}`).emit(event, data);
}
