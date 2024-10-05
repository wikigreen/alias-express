import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();

const app: Express = express();
const server = createServer(app);
const socketio = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3000;

app.get("/ping", (req: Request, res: Response) => {
  res.send("Express + +");
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
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
