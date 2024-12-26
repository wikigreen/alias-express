import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useCreateGameMutation } from "../services";
import { GameSettings } from "../types";

interface GameFormProps {
  roomId: string;
  isAdmin: boolean;
}

const GameForm: React.FC<GameFormProps> = ({ roomId, isAdmin }) => {
  const [winningScore, setWinningScore] = useState<number>(40); // Default score
  const [roundTime, setRoundTime] = useState<number>(60); // Default time in seconds
  const [createGame, { isLoading }] = useCreateGameMutation();

  const handleCreateGame = async () => {
    const gameSettings: GameSettings = {
      winningScore,
      roundTime,
      roomId,
    };

    try {
      await createGame(gameSettings);
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 400,
        margin: "auto",
      }}
    >
      <Typography variant="h6">Create Game</Typography>

      <TextField
        label="Winning Score"
        type="number"
        value={winningScore}
        onChange={(e) => setWinningScore(Number(e.target.value))}
        disabled={!isAdmin}
      />

      <TextField
        label="Guesses Time (seconds)"
        type="number"
        value={roundTime}
        onChange={(e) => setRoundTime(Number(e.target.value))}
        disabled={!isAdmin}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateGame}
      >
        {isLoading ? "Creating..." : "Create Game"}
      </Button>
    </Box>
  );
};

export default GameForm;
