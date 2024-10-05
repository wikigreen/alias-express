import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "path";

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
app.get("/api/rand", (req: Request, res: Response) => {
  res.send({ number: Math.floor(Math.random() * 100000) });
});
app.get("/api/ping", (req: Request, res: Response) => {
  res.send("pong");
});

socketio.on("connection", (socket) => {
  console.log("new client connection" + socket.id);

  // Respond to custom events
  socket.on("message", (data) => {
    console.log(`Message from ${socket.id}:`, data);
    socket.emit("response", { message: "Message received!" });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}/ping`);
});
