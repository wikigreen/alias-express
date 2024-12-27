export enum GameStatus {
  OPEN = "OPEN",
  IN_GAME = "IN_GAME",
  CLOSED = "CLOSED",
}

export interface Room {
  id: string;
  status: GameStatus;
}

export interface GetRoomResponse extends Room {
  playerId: string;
  nickname: string;
  currentGameId: string;
  isAdmin: boolean;
}
