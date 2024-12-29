import { Router } from "express";
import { roomService } from "./roomService";
import { logErrorMessage } from "../utils";
import asyncHandler from "../common/routesExceptionHandler/asyncHandler";
import { gameService } from "../game/gameService";

export const roomRouter = Router();
export const protectedRoomRouter = Router();

protectedRoomRouter.use(async (req, res, next) => {
  const roomId = req.body.roomId;
  const playerId = req.cookies?.[`room:${roomId}`];
  const isAdmin = await roomService.isAdmin(roomId, playerId);
  if (isAdmin) {
    next();
  } else {
    res.status(403).send("Access denied. Admins only.");
  }
});

roomRouter.post("/", async (_, res) => {
  const room = await roomService.createRoom();
  res.send(room);
});

roomRouter.get("/:roomId", async (req, res, next) => {
  try {
    const room = await roomService.getRoom(req.params.roomId);
    if (room == null) {
      res.status(404).send({ message: "Room not found" });
      return;
    }

    const playerId = req.cookies?.[`room:${room.id}`];
    const isAdmin = await roomService.isAdmin(req.params.roomId, playerId);
    const { nickname } =
      (await roomService.getPlayer(req.params.roomId, playerId)) || {};
    res.send({
      ...room,
      ...(nickname
        ? {
            playerId,
            isAdmin,
            nickname,
          }
        : {}),
    });
  } catch (err) {
    logErrorMessage(err?.toString() || "");
    next(err);
  }
});

roomRouter.post("/:roomId", async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const nickname = req.body?.nickname as string;

    if (!nickname) {
      res.status(400);
    }

    const player = await roomService.connectPlayer(roomId, nickname);
    res.cookie(`room:${roomId}`, player?.id, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.send(player);
  } catch (e) {
    next(e);
  }
});

protectedRoomRouter.delete(
  "/player/:roomId",
  asyncHandler<{ roomId: string }, unknown, { playerNickname: string }>(
    async (req, res) => {
      const roomId = req.params.roomId;
      const playerNicknameToKick = req.body?.playerNickname;

      if (!playerNicknameToKick) {
        res.status(400);
        res.send("Player id is required");
        return;
      }

      const room = await roomService.getRoom(roomId);
      if (!room) {
        res.status(404);
        res.send(`No such room ${roomId}`);
        return;
      }

      const playerIdToKick = (
        await roomService.getPlayerByNickname(roomId, playerNicknameToKick)
      )?.id;

      if (!playerIdToKick) {
        res.status(404);
        res.send(`No such player with nickname ${playerNicknameToKick}`);
        return;
      }

      if (room.currentGameId) {
        await gameService.removePlayerFromTeam(
          roomId,
          room.currentGameId,
          playerIdToKick,
        );
      }
      await roomService.removePlayer(playerIdToKick, roomId);

      res.status(204);
      res.send();
    },
  ),
);
