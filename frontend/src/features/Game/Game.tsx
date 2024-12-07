import React, { useEffect } from "react";
import GameForm from "./CreateGame/GameForm.tsx";
import { useGameState } from "../../context/GameContext";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";

interface GameFormProps {
  roomId: string;
  isAdmin: boolean;
}

const Game: React.FC<GameFormProps> = ({ roomId, isAdmin }) => {
  const { gameState: data } = useGameState();

  useEffect(() => {
    console.log({ data });
  }, [data]);

  if (!data) {
    return <GameForm isAdmin={isAdmin} roomId={roomId} />;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Game
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />

      {/* Game Status Section */}
      <CardContent>
        <Typography variant="h6">Game Status</Typography>
        <Typography>
          Status: <strong>{data.gameStatus}</strong>
        </Typography>
        <Typography>
          Current Word: <strong>{data.currentWord || "None"}</strong>
        </Typography>
        <Typography>
          Current Team: <strong>{data.currentTeam || "None"}</strong>
        </Typography>
        <Typography>
          Remaining Time: <strong>{data.remainingTime} seconds</strong>
        </Typography>
      </CardContent>
      <Card sx={{ marginBottom: 2 }}></Card>

      {/* Game Settings Section */}
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6">Game Settings</Typography>
          <Typography>
            Winning Score:{" "}
            <strong>{data.gameSettings.winningScore || "Not Set"}</strong>
          </Typography>
          <Typography>
            Round Time:{" "}
            <strong>{data.gameSettings.roundTime || "Not Set"}</strong>
          </Typography>
        </CardContent>
      </Card>

      {/* Teams Section */}
      <Typography variant="h6" gutterBottom>
        Teams
      </Typography>
      <Grid container spacing={2}>
        {data.teams.map((team, index) => (
          <Grid item xs={12} sm={6} key={team.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Team {index + 1}</Typography>
                <Typography>ID: {team.id}</Typography>
                <Typography>
                  Score: <strong>{team.score}</strong>
                </Typography>
                <Typography>
                  Describer: <strong>{team.describer || "None"}</strong>
                </Typography>
                <Typography>Players:</Typography>
                {team.players.length > 0 ? (
                  <ul>
                    {team.players.map((player) => (
                      <li key={player.id}>{player.nickname}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No players</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Game;
