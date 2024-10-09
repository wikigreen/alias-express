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
  const [player, count] = await roomRepository.addPlayer(roomId, {
    online: true,
    nickname,
  } as Player);
  if (count > 1) {
    return player;
  }
  return roomRepository.updatePlayer({ id: player.id, isAdmin: true });
};

const removePlayer = async (
  playerId: string,
  playerRoom: string,
): Promise<void> => {
  await roomRepository.removePlayer(playerId, playerRoom);
};

const updatePlayer = async (
  player: Partial<Player>,
): Promise<Partial<Player>> => {
  return roomRepository.updatePlayer(player);
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

export const roomService = {
  createRoom,
  getRoom,
  connectPlayer,
  getPlayers,
  removePlayer,
  updatePlayer,
  disconnectPlayer,
};
