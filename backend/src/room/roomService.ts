import { GameStatus, Room, Player } from "./types";
import { roomRepository } from "./roomRepository";
import { Optional } from "../utils";
import { NotFoundError } from "../common/routesExceptionHandler";
import { EntityAlreadyExistsError } from "../common/routesExceptionHandler";
import { socketio } from "../index";

const createRoom = async (): Promise<Room> => {
  return roomRepository.createRoom({
    status: GameStatus.OPEN,
    currentGameId: null,
  });
};

const getRoom = async (roomId: Room["id"]): Promise<Optional<Room>> => {
  return roomRepository.getRoom(roomId);
};

const getPlayerByNickname = async (
  roomId: Room["id"],
  playerNickname: string,
): Promise<Optional<Player>> => {
  return (await roomRepository.getPlayers(roomId))?.find(
    ({ nickname }) => nickname === playerNickname,
  );
};

const connectPlayer = async (
  roomId: Room["id"],
  nickname: string,
): Promise<Optional<Partial<Player>>> => {
  const room = await getRoom(roomId);
  if (!room) {
    throw new NotFoundError(`Room with id ${roomId} was not found`);
  }

  if (await roomRepository.existsByNickname(roomId, nickname)) {
    throw new EntityAlreadyExistsError(
      `Player with nickname ${nickname} is already exists`,
      nickname,
    );
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
  roomService.getPlayers(playerRoom).then((players) => {
    socketio.to(playerRoom).emit("playerConnect", players);
  });
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

const getPlayers = async (
  roomId: Room["id"],
  hideIds = true,
): Promise<Partial<Player>[]> => {
  const players = await roomRepository.getPlayers(roomId);
  return players.map((p) => ({
    ...p,
    ...(hideIds ? { id: undefined } : {}),
  }));
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

const getRoomIdForPlayerId = async (playerId: string): Promise<string> => {
  return await roomRepository.getRoomIdForPlayerId(playerId);
};

const setGameId = async (roomId: string, gameId: string): Promise<void> => {
  await roomRepository.updateRoom({ id: roomId, currentGameId: gameId });
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
  getRoomIdForPlayerId,
  setGameId,
  getPlayerByNickname,
};
