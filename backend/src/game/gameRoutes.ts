import { Router } from "express";
import { roomService } from "../room/roomService";
import { gameService } from "./gameService";

export const gameRouter = Router();
export const protectedGameRouter = Router();

protectedGameRouter.use(async (req, res, next) => {
  const roomId = req.body?.roomId;
  console.log("$roomId", roomId);
  console.log("req", req);
  if (!roomId) {
    res.status(403).send("Access denied. Admins only.");
  }
  const playerId = req.cookies?.[`room:${roomId}`];
  console.log("playerId", playerId);
  const isAdmin = await roomService.isAdmin(roomId, playerId);
  console.log("isAdmin", isAdmin);
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
