import {
  createContext,
  useEffect,
  useState,
  useContext,
  PropsWithChildren,
} from "react";
import { io, Socket } from "socket.io-client";

type GameState = Record<string, string>;

interface GameStateContextType {
  socket: Socket | null;
  gameState: GameState | null;
}

export const GameStateContext = createContext<GameStateContextType | undefined>(
  undefined,
);

interface GameStateProviderProps {
  nickname?: string;
  roomId?: string;
}

export const useGameState = () => useContext(GameStateContext);

export const GameStateProvider = ({
  children,
  nickname,
  roomId,
}: PropsWithChildren<GameStateProviderProps>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (roomId && nickname) {
      const newSocket: Socket = io("", {
        query: { roomId, nickname },
      });
      setSocket(newSocket);

      newSocket.on("stateUpdate", (updatedState: GameState) => {
        setGameState(updatedState);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [roomId, nickname]);

  return (
    <GameStateContext.Provider value={{ socket, gameState }}>
      {children}
    </GameStateContext.Provider>
  );
};
