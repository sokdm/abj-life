const { createServer } = require("http");
const os = require("os");
const next = require("next");
const { Server } = require("socket.io");
const { jwtVerify } = require("jose");
const mongoose = require("mongoose");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const presence = new Map();
const blockedUntil = new Map();
const movementState = new Map();

function readCookie(cookieHeader, name) {
  return cookieHeader
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)?.[1];
}

function cleanText(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  console.log(`MongoDB warmup: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@")}`);
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 15000
  });
}

function locationMessageModel() {
  const schema = new mongoose.Schema(
    {
      locationId: { type: String, required: true, index: true },
      senderUserId: { type: String, required: true, index: true },
      username: { type: String, required: true },
      avatar: { type: String, default: "ABJ" },
      body: { type: String, required: true, maxlength: 240 },
      edited: { type: Boolean, default: false },
      moderationStatus: { type: String, enum: ["visible", "hidden", "flagged"], default: "visible", index: true }
    },
    { timestamps: true }
  );
  schema.index({ locationId: 1, createdAt: -1 });
  return mongoose.models.LocationMessage || mongoose.model("LocationMessage", schema);
}

async function getSocketUser(socket) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const cookieName = process.env.COOKIE_NAME || "abj_session";
  const token = readCookie(socket.handshake.headers.cookie, cookieName);
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    return String(verified.payload.userId);
  } catch {
    return null;
  }
}

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: { origin: true, credentials: true }
  });

  io.use(async (socket, nextMiddleware) => {
    const userId = await getSocketUser(socket);
    if (!userId) return nextMiddleware(new Error("Unauthorized"));
    socket.data.userId = userId;
    socket.data.username = cleanText(socket.handshake.auth?.username || "Player");
    socket.data.avatar = cleanText(socket.handshake.auth?.avatar || "ABJ");
    nextMiddleware();
  });

  io.on("connection", (socket) => {
    presence.set(socket.data.userId, {
      userId: socket.data.userId,
      username: socket.data.username,
      avatar: socket.data.avatar,
      status: "Online",
      locationId: null,
      updatedAt: Date.now()
    });

    socket.emit("presence:count", presence.size);
    io.emit("presence:summary", Array.from(presence.values()).map(({ userId, username, avatar, status, locationId }) => ({ userId, username, avatar, status, locationId })));

    socket.on("location:join", async ({ locationId }) => {
      const safeLocation = cleanText(locationId);
      if (!safeLocation) return;
      const previous = socket.data.locationId;
      if (previous) socket.leave(`location:${previous}`);
      socket.data.locationId = safeLocation;
      socket.join(`location:${safeLocation}`);
      const item = presence.get(socket.data.userId);
      if (item) {
        item.locationId = safeLocation;
        item.updatedAt = Date.now();
      }
      try {
        await connectMongo();
        const LocationMessage = locationMessageModel();
        const history = await LocationMessage.find({ locationId: safeLocation, moderationStatus: "visible" }).sort({ createdAt: -1 }).limit(30).lean();
        socket.emit("chat:history", {
          locationId: safeLocation,
          messages: history.reverse().map((msg) => ({
            id: String(msg._id),
            userId: msg.senderUserId,
            username: msg.username,
            avatar: msg.avatar,
            message: msg.body,
            createdAt: msg.createdAt
          }))
        });
      } catch {
        socket.emit("chat:history", { locationId: safeLocation, messages: [] });
      }
      io.to(`location:${safeLocation}`).emit("location:players", Array.from(presence.values()).filter((player) => player.locationId === safeLocation));
    });

    socket.on("chat:send", async ({ locationId, message }) => {
      const now = Date.now();
      const limitKey = `${socket.data.userId}:chat`;
      if ((blockedUntil.get(limitKey) || 0) > now) return;
      blockedUntil.set(limitKey, now + 1200);
      const safeLocation = cleanText(locationId);
      const safeMessage = cleanText(message);
      if (!safeLocation || !safeMessage || socket.data.locationId !== safeLocation) return;
      try {
        await connectMongo();
        const LocationMessage = locationMessageModel();
        const saved = await LocationMessage.create({
          locationId: safeLocation,
          senderUserId: socket.data.userId,
          username: socket.data.username,
          avatar: socket.data.avatar,
          body: safeMessage
        });
        io.to(`location:${safeLocation}`).emit("chat:message", {
          id: String(saved._id),
          userId: socket.data.userId,
          username: socket.data.username,
          avatar: socket.data.avatar,
          message: safeMessage,
          createdAt: saved.createdAt
        });
      } catch {
        socket.emit("system:notice", { message: "Chat could not be saved." });
      }
    });

    socket.on("player:move", ({ locationId, start, destination, path, timestamp }) => {
      const safeLocation = cleanText(locationId);
      if (!safeLocation || socket.data.locationId !== safeLocation) return;
      const now = Date.now();
      const dx = Number(destination?.x) - Number(start?.x);
      const dy = Number(destination?.y) - Number(start?.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Math.max(0.4, (now - Number(timestamp || now)) / 1000);
      if (!Number.isFinite(distance) || distance / elapsed > 8 || distance > 18) {
        socket.emit("system:notice", { message: "Movement rejected." });
        return;
      }
      const movement = {
        userId: socket.data.userId,
        username: socket.data.username,
        avatar: socket.data.avatar,
        locationId: safeLocation,
        start,
        destination,
        path: Array.isArray(path) ? path.slice(0, 40) : [],
        timestamp: now
      };
      movementState.set(socket.data.userId, movement);
      socket.to(`location:${safeLocation}`).emit("player:moved", movement);
    });

    socket.on("player:emote", ({ locationId, emote }) => {
      const safeLocation = cleanText(locationId);
      const safeEmote = cleanText(emote, 24);
      const now = Date.now();
      const limitKey = `${socket.data.userId}:emote`;
      if ((blockedUntil.get(limitKey) || 0) > now) return;
      blockedUntil.set(limitKey, now + 1800);
      if (!safeLocation || socket.data.locationId !== safeLocation || !safeEmote) return;
      io.to(`location:${safeLocation}`).emit("player:emote", {
        userId: socket.data.userId,
        username: socket.data.username,
        emote: safeEmote,
        createdAt: new Date().toISOString()
      });
    });

    socket.on("crew:join", ({ crewId }) => {
      const safeCrew = cleanText(crewId);
      if (safeCrew) socket.join(`crew:${safeCrew}`);
    });

    socket.on("crew:message", ({ crewId, message }) => {
      const safeCrew = cleanText(crewId);
      const safeMessage = cleanText(message);
      if (!safeCrew || !safeMessage) return;
      io.to(`crew:${safeCrew}`).emit("crew:message", {
        userId: socket.data.userId,
        username: socket.data.username,
        message: safeMessage,
        createdAt: new Date().toISOString()
      });
    });

    socket.on("direct:send", ({ toUserId, message }) => {
      const safeMessage = cleanText(message);
      const safeTo = cleanText(toUserId);
      if (!safeTo || !safeMessage) return;
      for (const target of io.sockets.sockets.values()) {
        if (target.data.userId === safeTo) {
          target.emit("direct:message", {
            fromUserId: socket.data.userId,
            username: socket.data.username,
            message: safeMessage,
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    socket.on("disconnect", () => {
      const previous = socket.data.locationId;
      presence.delete(socket.data.userId);
      movementState.delete(socket.data.userId);
      if (previous) {
        io.to(`location:${previous}`).emit("location:players", Array.from(presence.values()).filter((player) => player.locationId === previous));
      }
      io.emit("presence:count", presence.size);
    });
  });

  httpServer.listen(port, hostname, () => {
    const nets = os.networkInterfaces();
    const lan = Object.values(nets)
      .flat()
      .find((net) => net && net.family === "IPv4" && !net.internal)?.address;
    console.log(`ABJ Life Style ready on http://localhost:${port}`);
    console.log(`Local:   http://localhost:${port}`);
    console.log(`Network: ${lan ? `http://${lan}:${port}` : "No LAN IPv4 address detected"}`);
    connectMongo().catch((error) => {
      console.warn(`MongoDB warmup failed: ${error.message}`);
    });
  });
});
