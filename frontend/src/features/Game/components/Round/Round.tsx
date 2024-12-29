import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";
import { FC } from "react";
import { GameStatus } from "../../../../context/GameContext";

interface RoundProps {
  status?: GameStatus;
  currentWord?: string;
  onGuess: () => void;
  onSkip: () => void;
  onStartRound: () => void;
}

export const Round: FC<RoundProps> = ({
  status,
  onGuess,
  onSkip,
  onStartRound,
  currentWord,
}) => {
  if (!status) {
    return "No status";
  }

  if (status === "ongoing") {
    return (
      <Button
        variant="contained"
        color="success"
        sx={{ width: "100%" }}
        onClick={onStartRound}
      >
        Start round
      </Button>
    );
  }

  if (new Set<GameStatus>(["ongoingRound", "lastWord"]).has(status)) {
    return (
      <Card sx={{ width: "100%" }}>
        <CardContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
          }}
        >
          <Typography variant="h2">{currentWord}</Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="success"
            sx={{ width: "100%" }}
            onClick={onGuess}
          >
            Guess
          </Button>
          <Button variant="contained" color="error" onClick={onSkip}>
            Skip
          </Button>
        </CardActions>
      </Card>
    );
  }
};
