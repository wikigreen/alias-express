import { Optional } from "../../utils";

export type Team = {
  id: string;
  players: string[];
  describer: string;
  score: number;
  name: string;
};

export type GameSettings = {
  winningScore: number;
  roundTime: number;
};

export type GameStatus =
  | "waiting"
  | "ongoing"
  | "paused"
  | "completed"
  | "ongoingRound"
  | "lastWord";

export type AliasGameState = {
  id: string;
  teams: Team[];
  currentTeam: Optional<string>;
  currentPlayer: string | null;
  gameSettings: GameSettings;
  gameStatus: GameStatus;
  currentRound: number;
  isActivePlayer: boolean;
};
