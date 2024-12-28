import { FC } from "react";
import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import { Group, Person, EmojiEvents, Update } from "@mui/icons-material";

interface GameInfoProps {
  currentTeam: string;
  teamScore: number;
  playerGuessing: string;
  currentRound: number;
  scoreToWin: number;
  roundScore: number;
}

export const GameInfo: FC<GameInfoProps> = ({
  currentTeam,
  teamScore,
  playerGuessing,
  currentRound,
  scoreToWin,
  roundScore,
}) => {
  return (
    <Card sx={{ width: "100%", flex: 1 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Group color="primary" />
            <Typography variant="h6">
              Team: <Chip label={currentTeam} color="primary" />
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Person color="secondary" />
            <Typography variant="body1">
              Describer: <strong>{playerGuessing}</strong>
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
            {roundScore != null ? (
              <Typography variant="body1">{`(${roundScore > 0 ? "+" : ""}${roundScore})`}</Typography>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
