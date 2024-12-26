import { FC } from "react";
import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import { Timer, Group, Person, EmojiEvents, Update } from "@mui/icons-material";

interface GameInfoProps {
  currentTeam: string;
  teamScore: number;
  playerGuessing: string;
  currentRound: number;
  scoreToWin: number;
  remainingTime: string; // Format as "mm:ss" or similar
}

export const GameInfo: FC<GameInfoProps> = ({
  currentTeam,
  teamScore,
  playerGuessing,
  currentRound,
  scoreToWin,
  remainingTime,
}) => {
  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Group color="primary" />
            <Typography variant="h6">
              Team: <Chip label={currentTeam} color="primary" />
            </Typography>
          </Stack>

          {/* Player Guessing */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Person color="secondary" />
            <Typography variant="body1">
              Player Guessing: <strong>{playerGuessing}</strong>
            </Typography>
          </Stack>

          {/* Current Round */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Update color="info" />
            <Typography variant="body1">
              Round: <strong>{currentRound}</strong>
            </Typography>
          </Stack>

          {/* Score to Win */}
          <Stack direction="row" spacing={1} alignItems="center">
            <EmojiEvents color="success" />
            <Typography variant="body1" color="text.secondary">
              Score to Win: <strong>{scoreToWin}</strong>
            </Typography>
          </Stack>

          {/* Current Score */}
          <Stack direction="row" spacing={1} alignItems="center">
            <EmojiEvents color="action" />
            <Typography variant="body1">
              Team Score: <strong>{teamScore}</strong>
            </Typography>
          </Stack>

          {/* Remaining Time */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Timer color="error" />
            <Typography variant="body1" color="error">
              Remaining Time: <strong>{remainingTime}</strong>
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
