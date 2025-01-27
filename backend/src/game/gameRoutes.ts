import { Router } from "express";
import { roomService } from "../room/roomService";
import { gameService } from "./gameService";
import { AccessNotAllowed } from "../common/routesExceptionHandler";
import asyncHandler from "../common/routesExceptionHandler/asyncHandler";
import { Guess } from "../round/types";

export const gameRouter = Router();
export const protectedGameRouter = Router();

protectedGameRouter.use(
  asyncHandler(async (req, res, next) => {
    const roomId = req.body?.roomId;
    if (!roomId) {
      throw new AccessNotAllowed("Access denied. Admins only.");
    }
    const playerId = req.cookies?.[`room:${roomId}`];
    const isAdmin = await roomService.isAdmin(roomId, playerId);
    if (!isAdmin) {
      throw new AccessNotAllowed("Access denied. Admins only.");
    }
    next();
  }),
);

//Create game
protectedGameRouter.post("/", async (req, res) => {
  const room = await gameService.createGame({
    ...req.body,
    playerId: req.cookies?.[`room:${req.body?.roomId}`],
  });
  res.send(room);
});

//Start game
protectedGameRouter.put("/start", async (req, res) => {
  const { id: roomId, currentGameId: gameId } =
    (await roomService.getRoom(req.body?.roomId)) || {};
  await gameService.startGame(roomId!, gameId!);
  res.status(204);
  res.send();
});

//Randomize teams
protectedGameRouter.put(
  "/randomizeTeams",
  asyncHandler<unknown, unknown, { roomId: string; gameId: string }>(
    async (req, res) => {
      const roomId = req.body?.roomId;
      const gameId = req.body?.gameId;
      await gameService.randomizeTeams(roomId!, gameId!);
      res.status(204);
      res.send();
    },
  ),
);

//Clear teams
protectedGameRouter.put(
  "/clearTeams",
  asyncHandler<unknown, unknown, { roomId: string; gameId: string }>(
    async (req, res) => {
      const roomId = req.body?.roomId;
      const gameId = req.body?.gameId;
      await gameService.clearTeams(roomId!, gameId!);
      res.status(204);
      res.send();
    },
  ),
);

//Join team
gameRouter.post(
  "/team",
  asyncHandler<unknown, unknown, { roomId: string; teamId: string }>(
    async (req, res) => {
      const roomId = req.body?.roomId;
      const playerId = req.cookies?.[`room:${roomId}`];
      await gameService.joinTeam(roomId, req.body?.teamId, playerId);
      res.status(204);
      res.send();
    },
  ),
);

//Start round
gameRouter.patch(
  "/round",
  asyncHandler<unknown, unknown, { roomId: string; gameId: string }>(
    async (req, res) => {
      const roomId = req.body?.roomId;
      const gameId = req.body?.gameId;
      const playerId = req.cookies?.[`room:${roomId}`];
      await gameService.startRound(roomId, gameId, playerId);
      res.status(204);
      res.send();
    },
  ),
);

//Stop round
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

//Make guess
gameRouter.post(
  "/word",
  asyncHandler<unknown, unknown, { roomId: string; gameId: string }>(
    async (req, res) => {
      const roomId = req.body?.roomId;
      const gameId = req.body?.gameId;
      const playerId = req.cookies?.[`room:${roomId}`];
      const word = await gameService.getWord(gameId, playerId);
      res.status(200);
      res.send({ word });
    },
  ),
);

//Make guess
gameRouter.post(
  "/guess",
  asyncHandler<
    unknown,
    unknown,
    { roomId: string; gameId: string; guessed: boolean }
  >(async (req, res) => {
    const roomId = req.body?.roomId;
    const gameId = req.body?.gameId;
    const playerId = req.cookies?.[`room:${roomId}`];
    const word = await gameService.registerGuess(
      roomId,
      gameId,
      playerId,
      !!req.body?.guessed,
    );
    res.status(200);
    res.send({ word });
  }),
);

//Make guess
gameRouter.put(
  "/guess",
  asyncHandler<
    unknown,
    unknown,
    { roomId: string; gameId: string; guess: Guess }
  >(async (req, res) => {
    const roomId = req.body?.roomId;
    const gameId = req.body?.gameId;
    const guess = req.body?.guess;
    const playerId = req.cookies?.[`room:${roomId}`];
    await gameService.updateGuess(roomId, gameId, playerId, guess);
    res.status(204);
    res.send();
  }),
);

//Get info about score for game
gameRouter.post("/info/score/:gameId", async (req, res) => {
  const { gameId } = req.params;
  const { teamsIds } = req.body || {};

  res.status(200);
  const score = await gameService.getScore(gameId, teamsIds);
  res.send(score);
});
