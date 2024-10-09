import React, { useCallback, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { NicknameInput } from "../../features/NicknameInput";
import { useParams } from "react-router";
import { useGetRoomQuery } from "../../features/Room";
import { GameStateProvider } from "../../context/GameContext";
import { PlayersList } from "../../features/PlayersList/PlayersList.tsx";

export const GameRoomLayout: React.FC = () => {
  const [nickname, setNickname] = useState<string>();
  const { roomId } = useParams();

  const { data, isFetching, isError } = useGetRoomQuery(roomId || "", {
    skip: !roomId,
  });

  const onNicknameEnter = useCallback(
    (nickname: string) => {
      setNickname(nickname);
    },
    [setNickname],
  );

  if (isFetching) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: "flex" }}>
        <Typography component="h6">Oops... Error occurred!</Typography>
      </Box>
    );
  }

  if (!nickname) {
    return <NicknameInput onEnter={onNicknameEnter} roomId={data?.id} />;
  }

  return (
    <GameStateProvider nickname={nickname} roomId={roomId}>
      <Typography gutterBottom variant="h3" component="div">
        You are welcome {nickname}
      </Typography>
      <PlayersList />
    </GameStateProvider>
  );
};
