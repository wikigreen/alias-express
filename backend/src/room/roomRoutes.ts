import { Router } from "express";
import { roomService } from "./roomService";

const roomRouter = Router();

roomRouter.post("/", async (_, res) => {
  const room = await roomService.createRoom();
  res.send(room);
});

roomRouter.get("/:roomId", async (req, res) => {
  const room = await roomService.getRoom(req.params.roomId);
  if (room == null) {
    res.status(404).send({ message: "Room not found" });
    return;
  }
  res.send(room);
});

export default roomRouter;
