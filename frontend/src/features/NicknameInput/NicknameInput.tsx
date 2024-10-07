import React from "react";
import { TextField } from "@mui/material";

interface NicknameInputProps {
  onEnter: (nickname: string) => void;
}

export const NicknameInput: React.FC<NicknameInputProps> = () => {
  return (
    <TextField
      required
      id="outlined-required"
      label="Required"
      defaultValue="Hello World"
    />
  );
};
