import express, { Express, Request, Response, Router } from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import path from "path";
import { protectedRoomRouter, roomRouter } from "./room/roomRoutes";
import cookieParser from "cookie-parser";
import { gameRouter, protectedGameRouter } from "./game/gameRoutes";
import { exceptionHandlingMiddleware } from "./common/routesExceptionHandler";
import { initSocketIo } from "./socketio";
import { logMessage } from "./utils";

dotenv.config();

const app: Express = express();
export const server = createServer(app);
export const socketio = initSocketIo(server);

app.use(express.static(path.join(__dirname, "./frontend")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend", "index.html"));
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

server.listen(port, () => {
  logMessage(
    `[server]: Server is running at http://localhost:${port}/api/ping`,
  );
});
