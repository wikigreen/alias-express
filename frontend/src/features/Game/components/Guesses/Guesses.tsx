import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { FC } from "react";
import { Guess } from "../../../../context/GameContext";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface GuessesProps {
  guesses?: Guess[];
  isActive: boolean;
  onSwitch: (id: string, guessed: boolean) => void;
}

export const Guesses: FC<GuessesProps> = ({ guesses, onSwitch, isActive }) => {
  if ((guesses?.length || 0) < 1) {
    return null;
  }

  // Sort guesses by creation time descending
  const sortedGuesses = [...(guesses || [])].sort(
    (a, b) => b.createTime - a.createTime,
  );

  return (
    <Card sx={{ width: "100%", maxHeight: "500px", overflow: "auto" }}>
      <CardContent>
        <FormGroup>
          {sortedGuesses.map(({ id, word, guessed }) => (
            <FormControlLabel
              key={id}
              control={
                <Checkbox
                  checked={guessed}
                  color={guessed ? "success" : "error"}
                  icon={<CancelIcon color="error" />}
                  checkedIcon={<CheckCircleIcon />}
                  onChange={isActive ? () => onSwitch(id, !guessed) : undefined}
                />
              }
              label={<Typography variant="h6">{word}</Typography>}
            />
          ))}
        </FormGroup>
      </CardContent>
    </Card>
  );
};
