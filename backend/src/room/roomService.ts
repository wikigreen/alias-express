import { GameStatus, Room, Player } from "./types";
import { roomRepository } from "./roomRepository";
import { Optional } from "../utils";

const createRoom = async (): Promise<Room> => {
  return roomRepository.createRoom({ status: GameStatus.OPEN });
};

const getRoom = async (roomId: Room["id"]): Promise<Optional<Room>> => {
  return roomRepository.getRoom(roomId);
};

const connectPlayer = async (
  roomId: Room["id"],
  nickname: string,
): Promise<Optional<Partial<Player>>> => {
  const room = await getRoom(roomId);
  if (!room) {
    throw new Error(`Room with id ${roomId} was not found`);
  }

  const player = await roomRepository.addPlayer(roomId, {
    online: true,
    nickname,
  } as Player);

  const players = await roomRepository.getPlayers(roomId);
  if (players.length > 1) {
    return player;
  }
  await roomRepository.updatePlayer({
    id: players[0].id,
    roomId,
    isAdmin: true,
  });
  return roomRepository.getPlayer(roomId, player.id);
};

const removePlayer = async (
  playerId: string,
  playerRoom: string,
): Promise<void> => {
  await roomRepository.removePlayer(playerId, playerRoom);
};

const updatePlayer = async (
  player: Partial<Player>,
): Promise<Optional<Partial<Player>>> => {
  if (!player?.id || !player.roomId) {
    return {};
  }
  await roomRepository.updatePlayer(player);
  return roomRepository.getPlayer(player.roomId, player.id);
};

const disconnectPlayer = async (
  playerId: string,
  playerRoom: string,
): Promise<Partial<Player>> => {
  return roomRepository.updatePlayer({
    id: playerId,
    roomId: playerRoom,
    online: false,
  });
};

const getPlayers = async (roomId: Room["id"]): Promise<Partial<Player>[]> => {
  const players = await roomRepository.getPlayers(roomId);
  return players.map((p) => ({ ...p, id: undefined }));
};

const getPlayer = async (
  roomId: Room["id"],
  playerId: Player["id"],
): Promise<Optional<Player>> => {
  return roomRepository.getPlayer(roomId, playerId);
};

const isAdmin = async (
  roomId: Room["id"],
  playerId: Player["id"],
): Promise<boolean> => {
  return !!(await roomRepository.getPlayer(roomId, playerId))?.isAdmin;
};

export const roomService = {
  createRoom,
  getRoom,
  connectPlayer,
  getPlayers,
  removePlayer,
  updatePlayer,
  disconnectPlayer,
  getPlayer,
  isAdmin,
};
