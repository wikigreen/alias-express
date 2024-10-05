import { redisClient } from "../redis";
import { GameStatus, Room } from "./types/Room";
import { randomUUID } from "node:crypto";

export const createRoom = async (room: Omit<Room, "id">): Promise<Room> => {
  const roomId = randomUUID();
  const roomKey = `room:${roomId}`;
  await (
    await redisClient
  ).hSet(roomKey, {
    status: room.status,
  });
  const roomResult: Room = {
    id: roomId,
    status: room.status,
  };

  console.log(`Created room: ${JSON.stringify(roomResult)}`);

  return roomResult;
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  const roomKey = `room:${roomId}`;
  const roomData = await (await redisClient).hGetAll(roomKey);

  if (Object.keys(roomData).length === 0) {
    console.log(`Room ${roomId} not found`);
    return null;
  }

  const room: Room = {
    id: roomId,
    status: roomData.status as GameStatus,
  };

  console.log(`Room ${roomId}:`, room);
  return room;
};
