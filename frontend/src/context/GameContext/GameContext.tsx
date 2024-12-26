import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { Player } from "./types";
import { useGameScore } from "./hooks";

interface GameStateContextType {
  socket: Socket | null;
  players: Player[];
  gameState: AliasGameState | null;
  isActivePlayer: boolean;
  guesses: Guess[];
  score: Record<string, number>;
  remainingTime: number;
}

export const GameStateContext = createContext<GameStateContextType>(
  {} as GameStateContextType,
);

type AliasGameState = {
  id: string;
  teams: Team[];
  currentWord: string | null;
  currentTeam: string | null;
  currentPlayer: string | null;
  remainingTime: number;
  gameSettings: GameSettings;
  gameStatus: GameStatus;
  roundStartedAt: Date | null;
  currentRound: number;
  isActivePlayer: boolean;
  winnerTeamId?: string;
};

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
  | "guessesCorrection"
  | "lastWord";

export interface Guess {
  id: string;
  word: string;
  guessed: boolean;
  createTime: number;
}

interface GameStateProviderProps {
  roomId?: string;
  gameId?: string;
}

export const GameStateProvider = ({
  children,
  roomId,
  gameId: gameIdFromRequest,
}: PropsWithChildren<GameStateProviderProps>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isActivePlayer, setIsActivePlayer] = useState<boolean>(false);
  const [gameState, setGameState] = useState<AliasGameState | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [remainingTime, setRemainingTime] = useState(0);

  const gameId = useMemo(
    () => gameState?.id || gameIdFromRequest,
    [gameState?.id, gameIdFromRequest],
  );

  const { score, setScore } = useGameScore(gameState?.id || gameId);

  useEffect(() => {
    if (roomId) {
      const newSocket: Socket = io("", {
        query: { roomId },
      });
      setSocket(newSocket);

      newSocket.on("playerConnect", (updatedState: Player[]) => {
        setPlayers(updatedState);
      });

      newSocket.on("isActivePlayer", (isActivePlayer: boolean) => {
        setIsActivePlayer(isActivePlayer);
      });

      newSocket.on("gameState", (updatedState: AliasGameState) => {
        setGameState(updatedState);
      });

      newSocket.on("guesses", (guesses: Guess[]) => {
        setGuesses(guesses);
      });

      newSocket.on("score", (score: Record<string, number>) => {
        setScore(score);
      });

      newSocket.on("countdown", (remainingTime: number) => {
        setRemainingTime(remainingTime);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [roomId]);

  useEffect(() => {
    if (gameState?.gameStatus === "ongoing") {
      setGuesses([]);
    }
  }, [gameState?.gameStatus]);

  useEffect(() => {
    if (socket && (gameState?.id || gameId) != null) {
      socket.emit("connectGame");
    }
  }, [socket, gameState?.id, gameId]);

  return (
    <GameStateContext.Provider
      value={{
        socket,
        players,
        gameState,
        isActivePlayer,
        guesses,
        score,
        remainingTime,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};
