import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
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
  isGuessCorrectionStage: boolean;
  onSwitch: (id: string, guessed: boolean) => void;
  onFinishRound: () => void;
}

export const Guesses: FC<GuessesProps> = ({
  guesses,
  onSwitch,
  isActive,
  isGuessCorrectionStage,
  onFinishRound,
}) => {
  if ((guesses?.length || 0) < 1) {
    return null;
  }

  // Sort guesses by creation time descending
  const sortedGuesses = [...(guesses || [])].sort(
    (a, b) => b.createTime - a.createTime,
  );

  return (
    <Card sx={{ width: "100%", overflow: "auto" }}>
      <CardHeader
        title="Guesses"
        subheader={isGuessCorrectionStage ? "Fix guesses if needed" : undefined}
      />
      <CardContent sx={{ overflowY: "auto", maxHeight: "450px", mb: 2 }}>
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
      {isGuessCorrectionStage ? (
        <CardActions>
          <Button
            variant="contained"
            color="success"
            disabled={!isActive}
            onClick={onFinishRound}
          >
            Submit
          </Button>
        </CardActions>
      ) : null}
    </Card>
  );
};
