import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "path";
import roomRouter from "./room/roomRoutes";
import { roomService } from "./room/roomService";
import { Player } from "./room/types";

dotenv.config();

const app: Express = express();
const server = createServer(app);
const socketio = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"],
  },
});

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

const port = process.env.PORT || 3000;

app.use("/api/room", roomRouter);

app.get("/api/ping", (req: Request, res: Response) => {
  res.send("pong");
});

socketio.on("connection", async (socket) => {
  const { roomId, nickname } = socket.handshake.query as Omit<
    Player,
    "id" | "online" | "isAdmin"
  >;
  await roomService
    .connectPlayer(roomId, nickname)
    .then((player) => {
      if (!player) {
        socket.disconnect();
      }
      socket.join(roomId);
      return roomService.getPlayers(roomId);
    })
    .then((players) => {
      socket.emit("selfConnect", players);
      socketio.to(roomId).emit("playerConnect", players);
    });

  console.log("new client connection" + socket.id);
  console.log("Room id is" + roomId);

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}/ping`);
});
