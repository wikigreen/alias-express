import { redisClient } from "../redis";
import { GameStatus, Player, Room } from "./types";
import { randomUUID } from "node:crypto";
import { Optional, stringifyObjectValues } from "../utils";

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
    currentGameId: null,
  };

  return roomResult;
};

const updateRoom = async ({
  id: roomId,
  ...room
}: Partial<Room>): Promise<void> => {
  const roomKey = getRoomKey(roomId);
  await redisClient.then((client) =>
    client.hSet(roomKey, stringifyObjectValues(room)),
  );
};

const getRoom = async (roomId: string): Promise<Optional<Room>> => {
  const roomKey = getRoomKey(roomId);
  const roomData = await redisClient.then((client) => client.hGetAll(roomKey));

  if (Object.keys(roomData).length === 0) {
    return null;
  }

  const room: Room = {
    id: roomId,
    status: roomData.status as GameStatus,
    currentGameId: roomData.currentGameId as GameStatus,
  };

  return room;
};

const addPlayer = async (roomId: string, player: Player): Promise<Player> => {
  const playerId = randomUUID();
  const playerKey = getRoomPlayerKey(roomId, playerId);
  await redisClient.then((client) =>
    client.hSet(playerKey, {
      roomId,
      nickname: player.nickname || "",
      online: +player.online,
    }),
  );

  const resPlayer: Player = {
    id: playerId,
    roomId,
    online: player.online,
    nickname: player.nickname,
    isAdmin: false,
  };

  return resPlayer;
};

const removePlayer = async (
  playerId: string,
  playerRoom: string,
): Promise<void> => {
  const playerKey = getRoomPlayerKey(playerRoom, playerId);
  await redisClient.then((client) => client.del(playerKey));
};

const updatePlayer = async (
  player: Partial<Player>,
): Promise<Partial<Player>> => {
  const playerKey = getRoomPlayerKey(player.roomId, player.id);
  await redisClient.then((client) => {
    const result = {
      ...(player.roomId ? { roomId: player.roomId } : {}),
      ...(player.nickname ? { nickname: player.nickname } : {}),
      ...(player.online != null ? { online: +player.online } : {}),
      ...(player.isAdmin != null ? { isAdmin: +player.isAdmin } : {}),
    };

    client.hSet(playerKey, result);
  });

  const resPlayer: Partial<Player> = {
    id: player.id,
    roomId: player.roomId,
    online: player.online,
    nickname: player.nickname,
    isAdmin: player.isAdmin,
  };

  return resPlayer;
};

const getPlayers = async (roomId: string): Promise<Player[]> => {
  const playerIds = await redisClient
    .then((client) => client.keys(getRoomPlayerKey(roomId)))
    .then((playersKeys) =>
      playersKeys.map(fromRoomPlayerKey).map(({ playerId }) => playerId),
    );

  const players: Player[] = [];
  for (const id of playerIds) {
    const player = (await getPlayer(roomId, id)) as Player;
    players.push(player);
  }

  return players;
};

const getPlayer = async (
  roomId: string,
  playerId: string,
): Promise<Optional<Player>> => {
  const player = await redisClient.then((client) =>
    client.hGetAll(getRoomPlayerKey(roomId, playerId)),
  );
  return {
    id: playerId,
    roomId,
    nickname: player.nickname,
    online: !!+player.online,
    isAdmin: !!+player.isAdmin,
  } as Player;
};

const existsByNickname = async (
  roomId: string,
  nickname: string,
): Promise<boolean> => {
  return getPlayers(roomId).then((players) =>
    players.some((p) => p.nickname === nickname),
  );
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

const getRoomIdForPlayerId = async (playerId: string) => {
  return redisClient.then(async (client) => {
    const res = await client.scan(0, {
      MATCH: getRoomPlayerKey(undefined, playerId),
      COUNT: 1000,
    });
    const { roomId } = fromRoomPlayerKey(res?.keys?.[0]);
    return roomId;
  });
};

export const roomRepository = {
  createRoom,
  getRoom,
  addPlayer,
  getPlayers,
  updatePlayer,
  removePlayer,
  getPlayer,
  existsByNickname,
  getRoomIdForPlayerId,
  updateRoom,
};
