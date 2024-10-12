import { Router } from "express";

export const gameRouter = Router();
export const protectedGameRouter = Router();

// // Create room
// gameRouter.post("/", async (_, res) => {
//   const room = await roomService.createRoom();
//   res.send(room);
// });
//
// // Get room by id
// gameRouter.get("/:roomId", async (req, res) => {
//   const room = await roomService.getRoom(req.params.roomId);
//   if (room == null) {
//     res.status(404).send({ message: "Room not found" });
//     return;
//   }
//
//   console.log({ "req.cookies": req.cookies });
//   const playerId = req.cookies?.[`room:${room.id}`];
//   console.log({ "req.cookies:roomId": playerId });
//   res.send({ ...room, playerId });
// });
//
// // Connect to the room by id
// gameRouter.post("/:roomId", async (req, res) => {
//   const roomId = req.params.roomId;
//   console.log("body", req.body);
//   const nickname = req.body?.nickname as string;
//
//   if (!nickname) {
//     res.status(400);
//   }
//
//   const player = await roomService.connectPlayer(roomId, nickname);
//   res.cookie(`room:${roomId}`, player?.id, {
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60 * 24,
//   });
//   res.send(player);
// });
