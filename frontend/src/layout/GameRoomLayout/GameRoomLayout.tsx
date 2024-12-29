import React, { useCallback, useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { NicknameInput } from "../../features/Room";
import { useParams } from "react-router";
import { useConnectToRoomMutation, useGetRoomQuery } from "../../features/Room";
import { GameStateProvider } from "../../context/GameContext";
import { PlayersManagement } from "../../features/Game/PlayersList/PlayersManagement.tsx";
import { ErrorType } from "../../utils/errorHandler.ts";
import Game from "../../features/Game/Game.tsx";

export const GameRoomLayout: React.FC = () => {
  const { roomId } = useParams();

  const [connectToRoom, { error }] = useConnectToRoomMutation();

  const alreadyTakenNick = useMemo(
    () => (error as ErrorType)?.nickname,
    [(error as ErrorType)?.nickname],
  );

  const { data, isFetching, isError } = useGetRoomQuery(roomId || "", {
    skip: !roomId,
  });

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
    return (
      <NicknameInput
        onEnter={onNicknameEnter}
        roomId={data?.id}
        alreadyTakenNick={alreadyTakenNick}
      />
    );
  }

  return (
    <GameStateProvider roomId={roomId} gameId={data?.currentGameId}>
      <Box sx={{ margin: "auto", padding: 2 }}>
        <PlayersManagement isAdmin={data?.isAdmin} roomId={roomId!} />
        <Game
          roomId={roomId!}
          isAdmin={data?.isAdmin}
          nickname={data.nickname}
        />
      </Box>
    </GameStateProvider>
  );
};
