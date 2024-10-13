import express, { Express, Request, Response, Router } from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "path";
import { protectedRoomRouter, roomRouter } from "./room/roomRoutes";
import { roomService } from "./room/roomService";
import { Player } from "./room/types";
import cookieParser from "cookie-parser";
import { parse as parseCookies } from "cookie";
import { gameRouter, protectedGameRouter } from "./game/gameRoutes";
import { exceptionHandlingMiddleware } from "./common/routesExceptionHandler/exceptionHadlingMiddleware";

dotenv.config();

const app: Express = express();
const server = createServer(app);

app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

const port = process.env.PORT || 3000;

const apiRouter = Router();
apiRouter.use(express.json());
app.use("/api", apiRouter);

apiRouter.use("/room", roomRouter);
apiRouter.use("/room", protectedRoomRouter);

apiRouter.use("/game", gameRouter);
apiRouter.use("/game", protectedGameRouter);
apiRouter.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});
apiRouter.use(exceptionHandlingMiddleware);

const socketio = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
  },
});

socketio.on("connection", async (socket) => {
  const { roomId } = socket.handshake.query as Omit<
    Player,
    "id" | "online" | "isAdmin"
  >;
  const { [`room:${roomId}`]: playerId } = parseCookies(
    socket.handshake.headers.cookie || "",
  );

  if (!playerId) {
    socket.disconnect();
    return;
  }

  const player = await roomService.getPlayer(roomId, playerId);

  if (!player) {
    socket.disconnect();
    return;
  }
  socket.join(roomId);
  socket.join(playerId);
  await roomService.updatePlayer({
    id: player.id,
    roomId: roomId,
    online: true,
  });
  await roomService.getPlayers(roomId).then((players) => {
    socketio.to(roomId).emit("playerConnect", players);
  });

  socket.on("disconnect", () => {
    if (!player.id || !player.roomId) {
      return;
    }

    roomService
      .disconnectPlayer(player.id, player.roomId)
      .then(() => {
        socket.leave(roomId);
        socket.leave(playerId);
        return roomService.getPlayers(roomId);
      })
      .then((players) => {
        socketio.to(roomId).emit("playerConnect", players);
      });
  });
});

server.listen(port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${port}/api/ping`,
  );
});
