import React from "react";
import GameForm from "./CreateGame/GameForm.tsx";

interface GameFormProps {
  roomId: string;
  isAdmin: boolean;
}

const Game: React.FC<GameFormProps> = ({ roomId, isAdmin }) => {
  return <GameForm isAdmin={isAdmin} roomId={roomId} />;
};

export default Game;
