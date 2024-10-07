import React, { useState } from "react";
import { Button, TextField } from "@mui/material";

interface NicknameInputProps {
  onEnter: (nickname: string) => void;
}

export const NicknameInput: React.FC<NicknameInputProps> = ({ onEnter }) => {
  const [nick, setNick] = useState<string>();

  return (
    <>
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
    </>
  );
};
