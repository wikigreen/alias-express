export enum GameStatus {
  OPEN = "OPEN",
  IN_GAME = "IN_GAME",
  CLOSED = "CLOSED",
}

export interface Room {
  id: string;
  currentGameId: string | null;
  status: GameStatus;
}
