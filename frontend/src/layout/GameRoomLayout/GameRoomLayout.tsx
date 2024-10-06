import React, { useCallback, useState } from "react";
import { GameStateProvider } from "../../context/GameContext";
import { useParams } from "react-router";
import { NicknameInput } from "../../features/NicknameInput";

export const GameRoomLayout: React.FC = () => {
  const [nickname, setNickname] = useState<string>();
  const { roomId } = useParams();

  const onNicknameEnter = useCallback(
    (nickname: string) => {
      setNickname(nickname);
    },
    [setNickname],
  );

  if (!nickname) {
    return <NicknameInput onEnter={onNicknameEnter} />;
  }

  return (
    <GameStateProvider nickname={nickname} roomId={roomId}>
      <span>Hello from Game room</span>;
    </GameStateProvider>
  );
};
