import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Typography,
} from "@mui/material";

interface NicknameInputProps {
  onEnter: (nickname: string) => void;
  roomId?: string;
}

export const NicknameInput: React.FC<NicknameInputProps> = ({
  onEnter,
  roomId,
}) => {
  const [nick, setNick] = useState<string>();

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
          Room id is {roomId}
        </Typography>
      </CardContent>
      <TextField
        required
        id="outlined-required"
        label="Nickname"
        fullWidth
        sx={{ marginBottom: 2 }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setNick(event.target.value);
        }}
      />
      <Button
        size="small"
        fullWidth
        variant="contained"
        disabled={!nick}
        onClick={() => {
          if (nick) {
            onEnter?.(nick);
          }
        }}
      >
        Enter nickname
      </Button>
    </Card>
  );
};
