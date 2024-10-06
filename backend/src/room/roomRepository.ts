import { redisClient } from "../redis";
import { GameStatus, Player, Room } from "./types";
import { randomUUID } from "node:crypto";
import { Optional } from "../utils";

const createRoom = async (room: Omit<Room, "id">): Promise<Room> => {
  const roomId = randomUUID();
  const roomKey = getRoomKey(roomId);
  await redisClient.then((client) =>
    client.hSet(roomKey, {
      status: room.status,
    }),
  );
  const roomResult: Room = {
    id: roomId,
    status: room.status,
  };

  console.log(`Created room: ${JSON.stringify(roomResult)}`);

  return roomResult;
};

const getRoom = async (roomId: string): Promise<Optional<Room>> => {
  const roomKey = getRoomKey(roomId);
  const roomData = await redisClient.then((client) => client.hGetAll(roomKey));

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

const addPlayer = async (
  roomId: string,
  player: Player,
): Promise<[Player, number]> => {
  const playerId = randomUUID();
  const playerKey = getRoomPlayerKey(roomId, playerId);
  const playersAmount = await redisClient.then((client) =>
    client.hSet(playerKey, {
      roomId,
      nickname: player.nickname,
      online: +player.online,
    }),
  );

  console.log(`Number of players in room ${roomId} is ${playersAmount}`);

  const resPlayer: Player = {
    id: playerId,
    roomId,
    online: player.online,
    nickname: player.nickname,
    isAdmin: false,
  };

  console.log(`Player saved ${roomId}:`, resPlayer);
  return [resPlayer, playersAmount];
};

const updatePlayer = async (player: Player): Promise<Player> => {
  const playerKey = getRoomPlayerKey(player.roomId, player.id);
  await redisClient.then((client) =>
    client.hSet(playerKey, {
      roomId: player.roomId,
      nickname: player.nickname,
      online: +player.online,
      isAdmin: +player.isAdmin,
    }),
  );

  console.log(`Player is updated ${player.id}`);

  const resPlayer: Player = {
    id: player.id,
    roomId: player.roomId,
    online: player.online,
    nickname: player.nickname,
    isAdmin: false,
  };

  console.log(`Player saved ${resPlayer.roomId}:`, resPlayer);
  return resPlayer;
};

const getPlayers = async (roomId: string): Promise<Player[]> => {
  const playerKeys = await redisClient.then((client) =>
    client.keys(getRoomPlayerKey(roomId)),
  );

  const players: Player[] = [];
  for (const key of playerKeys) {
    const player = await redisClient.then((client) => client.hGetAll(key));
    const { playerId } = fromRoomPlayerKey(key);
    players.push({
      id: playerId,
      roomId,
      nickname: player.nickname,
      online: !!player.online,
    } as Player);
  }

  return players;
};

const getRoomKey = (roomId = "*") => {
  return `room:${roomId}`;
};

const getRoomPlayerKey = (roomId = "*", playerId = "*") => {
  return `room:${roomId}:player:${playerId}`;
};

const fromRoomPlayerKey = (key: string) => {
  const [, roomId, , playerId] = key.split(":");
  return { roomId, playerId };
};

export const roomRepository = {
  createRoom,
  getRoom,
  addPlayer,
  getPlayers,
  updatePlayer,
};
