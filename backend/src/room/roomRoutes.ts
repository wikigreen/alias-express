import { Router } from "express";
import { createRoom } from "./roomService";
import { getRoom } from "./roomService";

const roomRouter = Router();

roomRouter.post("/", async (_, res) => {
  const room = await createRoom();
  res.send(room);
});

roomRouter.get("/:roomId", async (req, res) => {
  const room = await getRoom(req.params.roomId);
  if (room == null) {
    res.status(404).send({ message: "Room not found" });
    return;
  }
  res.send(room);
});

export default roomRouter;
