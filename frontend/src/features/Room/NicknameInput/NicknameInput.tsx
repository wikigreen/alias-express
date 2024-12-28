import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

interface NicknameInputProps {
  onEnter: (nickname: string) => void;
  roomId?: string;
  alreadyTakenNick?: string;
}

export const NicknameInput: React.FC<NicknameInputProps> = ({
  roomId,
  onEnter,
  alreadyTakenNick,
}) => {
  const [nick, setNick] = useState<string>();

  const isAlreadyTaken = useMemo(() => {
    if (!alreadyTakenNick) return false;
    return alreadyTakenNick === nick;
  }, [alreadyTakenNick, nick]);

  return (
    <Card
      sx={{
        maxWidth: "35rem",
        height: "fit-content",
        margin: "auto",
        position: "absolute",
        inset: 0,
        padding: 2,
        borderRadius: 4,
      }}
      variant="outlined"
    >
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
        error={isAlreadyTaken}
        helperText={
          isAlreadyTaken
            ? "Nickname was already taken, try another one"
            : undefined
        }
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
        disabled={!nick || isAlreadyTaken}
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
