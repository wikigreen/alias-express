import { Card, CardContent, Chip, Stack } from "@mui/material";
import { FC } from "react";
import { Guess } from "../../../../context/GameContext";

interface GuessesProps {
  guesses?: Guess[];
}

export const Guesses: FC<GuessesProps> = ({ guesses }) => {
  if ((guesses?.length || 0) < 1) {
    return null;
  }

  // Sort guesses by creation time descending
  const sortedGuesses = [...(guesses || [])].sort(
    (a, b) => b.createTime - a.createTime,
  );

  return (
    <Card sx={{ width: "100%", maxHeight: "500px", overflow: "auto", flex: 2 }}>
      <CardContent>
        <Stack spacing={1} alignItems="center">
          {sortedGuesses.map(({ id, word, guessed }) => (
            <Chip
              key={id}
              label={word}
              color={guessed ? "success" : "error"}
              sx={{
                width: "100%", // Optional: Ensures consistent width
                maxWidth: 300, // Optional: Limits max width for better layout
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
