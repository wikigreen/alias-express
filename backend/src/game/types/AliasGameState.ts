type Player = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  players: Player[];
  describer: string;
  score: number;
};

export type GameSettings = {
  winningScore: number;
  roundTime: number;
};

type GameStatus = "waiting" | "ongoing" | "paused" | "completed";

export type AliasGameState = {
  teams: Team[];
  currentWord: string | null;
  currentTeam: string;
  remainingTime: number;
  gameSettings: GameSettings;
  gameStatus: GameStatus;
  roundStartedAt: Date | null;
};
