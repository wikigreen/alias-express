export type Team = {
  id: string;
  players: string[];
  describer: string;
  score: number;
};

export type GameSettings = {
  winningScore: number;
  roundTime: number;
};

type GameStatus = "waiting" | "ongoing" | "paused" | "completed";

export type AliasGameState = {
  id: string;
  teams: Team[];
  currentWord: string | null;
  currentTeam: string;
  remainingTime: number;
  gameSettings: GameSettings;
  gameStatus: GameStatus;
  roundStartedAt: Date | null;
};
