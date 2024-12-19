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
  const room = await gameService.createGame({
    ...req.body,
    playerId: req.cookies?.[`room:${req.body?.roomId}`],
  });
  res.send(room);
});

//Start game
protectedGameRouter.post("/start", async (req, res) => {
  const { id: roomId, currentGameId: gameId } =
    (await roomService.getRoom(req.body?.roomId)) || {};
  await gameService.startGame(roomId!, gameId!);
  res.status(204);
  res.send();
});

//Join team
gameRouter.post("/team", async (req, res) => {
  const roomId = req.body?.roomId;
  const gameId = req.body?.gameId;
  const playerId = req.cookies?.[`room:${roomId}`];
  const gameStatus = await gameService.getGameStatus(gameId);
  if ("waiting" !== gameStatus) {
    res.status(409);
    res.send();
    return;
  }
  await gameService.joinTeam(roomId, req.body?.teamId, playerId);
  res.status(204);
  res.send();
});

//Start round
gameRouter.patch("/round", async (req, res) => {
  const roomId = req.body?.roomId;
  const gameId = req.body?.gameId;
  const playerId = req.cookies?.[`room:${roomId}`];
  const isStarted = await gameService.startRound(roomId, gameId, playerId);
  if (!isStarted) {
    res.status(409);
    res.send(
      "You dont have permission to start a round or current state of game does not allow to start the round",
    );
    return;
  }
  res.status(204);
  res.send();
});

//Start round
gameRouter.patch("/round/stop", async (req, res) => {
  const roomId = req.body?.roomId;
  const gameId = req.body?.gameId;
  const playerId = req.cookies?.[`room:${roomId}`];
  const isFinished = await gameService.finishRound(roomId, gameId, playerId);
  if (!isFinished) {
    res.status(409);
    res.send(
      "You dont have permission to start a round or current state of game does not allow to start the round",
    );
    return;
  }
  res.status(204);
  res.send();
});

//Start round
gameRouter.post("/guess", async (req, res) => {
  const roomId = req.body?.roomId;
  const gameId = req.body?.gameId;
  const playerId = req.cookies?.[`room:${roomId}`];
  const isFinished = await gameService.registerGuess(
    roomId,
    gameId,
    playerId,
    !!req.body?.guessed,
  );
  if (!isFinished) {
    res.status(409);
    res.send("You dont have permission to guess");
    return;
  }
  res.status(204);
  res.send();
});
