import { useContext } from "react";
import { GameStateContext } from "../GameContext.tsx";

export const useGameState = () => useContext(GameStateContext);
