import { Router } from "express";
import { roomService } from "./roomService";

export const roomRouter = Router();
export const protectedRoomRouter = Router();

protectedRoomRouter.use(async (req, res, next) => {
  const roomId = req.params.roomId;
  const playerId = req.cookies?.[`room:${roomId}`];
  const isAdmin = await roomService.isAdmin(roomId, playerId);
  if (isAdmin) {
    next();
  } else {
    res.status(403).send("Access denied. Admins only.");
  }
});

// Create room
roomRouter.post("/", async (_, res) => {
  const room = await roomService.createRoom();
  res.send(room);
});

// Get room by id
roomRouter.get("/:roomId", async (req, res) => {
  const room = await roomService.getRoom(req.params.roomId);
  if (room == null) {
    res.status(404).send({ message: "Room not found" });
    return;
  }

  console.log({ "req.cookies": req.cookies });
  const playerId = req.cookies?.[`room:${room.id}`];
  console.log({ "req.cookies:roomId": playerId });
  res.send({ ...room, playerId });
});

// Connect to the room by id
roomRouter.post("/:roomId", async (req, res) => {
  const roomId = req.params.roomId;
  console.log("body", req.body);
  const nickname = req.body?.nickname as string;

  if (!nickname) {
    res.status(400);
  }

  const player = await roomService.connectPlayer(roomId, nickname);
  res.cookie(`room:${roomId}`, player?.id, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  });
  console.log("what exactly will return in the end", player);
  res.send(player);
});
