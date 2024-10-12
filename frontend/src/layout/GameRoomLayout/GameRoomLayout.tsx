import React, { useCallback } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { NicknameInput } from "../../features/Room";
import { useParams } from "react-router";
import { useConnectToRoomMutation, useGetRoomQuery } from "../../features/Room";
import { GameStateProvider } from "../../context/GameContext";
import { PlayersList } from "../../features/PlayersList/PlayersList.tsx";

export const GameRoomLayout: React.FC = () => {
  const { roomId } = useParams();

  const { data, isFetching, isError } = useGetRoomQuery(roomId || "", {
    skip: !roomId,
  });

  const [connectToRoom] = useConnectToRoomMutation();

  const onNicknameEnter = useCallback(
    (nickname: string) => {
      if (!roomId) {
        return;
      }
      connectToRoom({ roomId, nickname });
    },
    [connectToRoom],
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

  if (!data?.playerId) {
    return <NicknameInput onEnter={onNicknameEnter} roomId={data?.id} />;
  }

  return (
    <GameStateProvider roomId={roomId}>
      <Typography gutterBottom variant="h3" component="div">
        You are welcome player with id {data?.playerId}
      </Typography>
      <PlayersList />
    </GameStateProvider>
  );
};
