import React, { useCallback, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useGetRoomQuery } from "../services";
import { useParams } from "react-router";
import { NicknameInput } from "../../NicknameInput";
import { GameStateProvider } from "../../../context/GameContext";

export const RoomComponent: React.FC = () => {
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
    return (
      <Card
        sx={{
          width: "35rem",
          height: "fit-content",
          margin: "auto",
          position: "absolute",
          inset: 0,
          padding: 2,
          borderRadius: 4,
        }}
        variant="outlined"
      >
        <CardMedia
          sx={{ height: 140 }}
          image="https://placehold.co/600x400"
          title="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            You was connected successfully!
          </Typography>
          <Box component="br" />
          <Typography gutterBottom variant="h6" component="div">
            Room id is {data?.id}
          </Typography>
        </CardContent>
        <NicknameInput onEnter={onNicknameEnter} />
      </Card>
    );
  }

  return (
    <GameStateProvider nickname={nickname} roomId={roomId}>
      <Typography gutterBottom variant="h3" component="div">
        You are welcome {nickname}
      </Typography>
    </GameStateProvider>
  );
};
