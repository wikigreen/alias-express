import { createContext, useEffect, useState, PropsWithChildren } from "react";
import { io, Socket } from "socket.io-client";
import { Player } from "./types";

interface GameStateContextType {
  socket: Socket | null;
  players: Player[];
  gameState: AliasGameState | null;
}

export const GameStateContext = createContext<GameStateContextType>(
  {} as GameStateContextType,
);

type AliasGameState = {
  teams: Team[];
  currentWord: string | null;
  currentTeam: string;
  remainingTime: number;
  gameSettings: GameSettings;
  gameStatus: GameStatus;
  roundStartedAt: Date | null;
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
    <GameStateContext.Provider value={{ socket, players, gameState }}>
      {children}
    </GameStateContext.Provider>
  );
};
