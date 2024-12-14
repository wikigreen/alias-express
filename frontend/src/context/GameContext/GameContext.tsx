import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Player } from "./types";

interface GameStateContextType {
  socket: Socket | null;
  players: Player[];
  gameState: AliasGameState | null;
  isActivePlayer: boolean;
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
  isActivePlayer: boolean;
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

type GameStatus =
  | "waiting"
  | "ongoing"
  | "paused"
  | "completed"
  | "ongoingRound"
  | "lastWord";

interface GameStateProviderProps {
  roomId?: string;
  gameId?: string;
}

export const GameStateProvider = ({
  children,
  roomId,
}: PropsWithChildren<GameStateProviderProps>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isActivePlayer, setIsActivePlayer] = useState<boolean>(false);
  const [gameState, setGameState] = useState<AliasGameState | null>(null);

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

      return () => {
        newSocket.disconnect();
      };
    }
  }, [roomId]);

  useEffect(() => {
    if (socket) {
      socket.emit("connectGame");
    }
  }, [socket]);

  return (
    <GameStateContext.Provider
      value={{ socket, players, gameState, isActivePlayer }}
    >
      {children}
    </GameStateContext.Provider>
  );
};
