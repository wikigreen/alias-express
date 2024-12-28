import { redisClient } from "@/redis";
import { Player, Room } from "./types";
import { randomUUID } from "node:crypto";
import { Optional, parseObjectValues, stringifyObjectValues } from "@/utils";

const createRoom = async (room: Omit<Room, "id">): Promise<Room> => {
  const roomId = randomUUID();
  const roomKey = getRoomKey(roomId);
  await redisClient.then((client) =>
    client.hSet(
      roomKey,
      stringifyObjectValues({
        status: room.status,
      }),
    ),
  );
  return {
    id: roomId,
    status: room.status,
    currentGameId: null,
  };
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

  return {
    ...(parseObjectValues(roomData) as Room),
    id: roomId,
  };
};

const addPlayer = async (roomId: string, player: Player): Promise<Player> => {
  const playerId = randomUUID();
  const playerKey = getRoomPlayerKey(roomId, playerId);
  await redisClient.then((client) =>
    client.hSet(
      playerKey,
      stringifyObjectValues({
        ...player,
        roomId,
      }),
    ),
  );

  return {
    id: playerId,
    roomId,
    online: player.online,
    nickname: player.nickname,
    isAdmin: false,
  };
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
    client.hSet(playerKey, stringifyObjectValues(player));
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
    ...(parseObjectValues(player) as Player),
    id: playerId,
    roomId,
  };
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
