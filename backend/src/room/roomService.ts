import { GameStatus, Room } from "./types/Room";
import { createRoom as createRoomRep } from "./roomRepository";
import { getRoom as getRoomRep } from "./roomRepository";

export const createRoom = async (): Promise<Room> => {
  return createRoomRep({ status: GameStatus.OPEN });
};

export const getRoom = async (roomId: Room["id"]): Promise<Room | null> => {
  return getRoomRep(roomId);
};
