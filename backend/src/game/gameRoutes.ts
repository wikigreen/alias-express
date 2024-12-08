import { Router } from "express";
import { roomService } from "../room/roomService";
import { gameService } from "./gameService";

export const gameRouter = Router();
export const protectedGameRouter = Router();

protectedGameRouter.use(async (req, res, next) => {
  const roomId = req.body?.roomId;
  if (!roomId) {
    res.status(403).send("Access denied. Admins only.");
  }
  const playerId = req.cookies?.[`room:${roomId}`];
  const isAdmin = await roomService.isAdmin(roomId, playerId);
  if (isAdmin) {
    next();
  } else {
    res.status(403).send("Access denied. Admins only.");
  }
});

//Create game
protectedGameRouter.post("/", async (req, res) => {
  const room = await gameService.createGame(req.body);
  res.send(room);
});

//Start game
protectedGameRouter.post("/start", async (req, res) => {
  const { id: roomId, currentGameId: gameId } =
    (await roomService.getRoom(req.body?.roomId)) || {};
  await gameService.startGame(roomId, gameId as string);
  res.status(204);
  res.send();
});

//Join team
gameRouter.post("/team", async (req, res) => {
  const roomId = req.body?.roomId;
  const playerId = req.cookies?.[`room:${roomId}`];
  await gameService.joinTeam(roomId, req.body?.teamId, playerId);
  res.status(204);
  res.send();
});
