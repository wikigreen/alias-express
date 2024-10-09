import { createContext, useEffect, useState, PropsWithChildren } from "react";
import { io, Socket } from "socket.io-client";
import { Player } from "./types";

interface GameStateContextType {
  socket: Socket | null;
  players: Player[];
}

export const GameStateContext = createContext<GameStateContextType>(
  {} as GameStateContextType,
);

interface GameStateProviderProps {
  nickname?: string;
  roomId?: string;
}

export const GameStateProvider = ({
  children,
  nickname,
  roomId,
}: PropsWithChildren<GameStateProviderProps>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (roomId && nickname) {
      const newSocket: Socket = io("", {
        query: { roomId, nickname },
      });
      setSocket(newSocket);

      newSocket.on("playerConnect", (updatedState: Player[]) => {
        setPlayers(updatedState);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [roomId, nickname]);

  return (
    <GameStateContext.Provider value={{ socket, players }}>
      {children}
    </GameStateContext.Provider>
  );
};
