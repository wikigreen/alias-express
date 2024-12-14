import React, { useEffect } from "react";
import GameForm from "./CreateGame/GameForm.tsx";
import { useGameState } from "../../context/GameContext";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import {
  useJoinTeamMutation,
  useStartGameMutation,
  useStartRoundMutation,
} from "./services";
import { JoinTeamRequest } from "./types";

interface GameFormProps {
  roomId: string;
  isAdmin: boolean;
}

const Game: React.FC<GameFormProps> = ({ roomId, isAdmin }) => {
  const { gameState, isActivePlayer } = useGameState();
  const [joinTeam] = useJoinTeamMutation();
  const [startGame] = useStartGameMutation();
  const [startRound] = useStartRoundMutation();

  useEffect(() => {
    console.log({ data: gameState });
  }, [gameState]);

  const handleJoinTeam = async (teamId: string, gameId: string) => {
    const gameSettings: JoinTeamRequest = {
      roomId,
      gameId,
      teamId,
    };

    try {
      await joinTeam(gameSettings);
    } catch (error) {
      console.error("Failed to joinTeam:", teamId, error);
    }
  };

  const handleStartGame = async (gameId: string) => {
    const req = {
      roomId,
      gameId,
    };

    try {
      await startGame(req);
    } catch (error) {
      console.error("Failed to start game:", gameId, error);
    }
  };

  const handleStartRound = async (gameId: string) => {
    const req = {
      roomId,
      gameId,
    };

    try {
      await startRound(req);
    } catch (error) {
      console.error("Failed to start round:", gameId, error);
    }
  };

  if (!gameState) {
    return <GameForm isAdmin={isAdmin} roomId={roomId} />;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Game
      </Typography>
      <Button
        disabled={!isAdmin}
        onClick={() => handleStartGame(gameState?.id)}
      >
        Start game
      </Button>
      <Button
        disabled={!isActivePlayer}
        onClick={() => handleStartRound(gameState?.id)}
      >
        Start round
      </Button>
      <Divider sx={{ marginBottom: 2 }} />

      {/* Game Status Section */}
      <CardContent>
        <Typography variant="h6">Game Status</Typography>
        <Typography>
          ID: <strong>{gameState.id}</strong>
        </Typography>
        <Typography>
          Status: <strong>{gameState.gameStatus}</strong>
        </Typography>
        <Typography>
          Current Word: <strong>{gameState.currentWord || "None"}</strong>
        </Typography>
        <Typography>
          Current Active Team:
          <strong>{gameState.currentTeam || "None"}</strong>
        </Typography>
        <Typography>
          Is current player active:{" "}
          <strong>{isActivePlayer ? "Active" : "Not active"}</strong>
        </Typography>
        <Typography>
          Remaining Time: <strong>{gameState.remainingTime} seconds</strong>
        </Typography>
      </CardContent>

      {/* Game Settings Section */}
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6">Game Settings</Typography>
          <Typography>
            Winning Score:{" "}
            <strong>{gameState.gameSettings.winningScore || "Not Set"}</strong>
          </Typography>
          <Typography>
            Round Time:{" "}
            <strong>{gameState.gameSettings.roundTime || "Not Set"}</strong>
          </Typography>
        </CardContent>
      </Card>

      {/* Teams Section */}
      <Typography variant="h6" gutterBottom>
        Teams
      </Typography>
      <Grid container spacing={2}>
        {gameState.teams.map((team) => (
          <Grid item xs={12} sm={6} key={team.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Name: {team.name}</Typography>
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
                      <li key={player}>{player}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No players</Typography>
                )}
              </CardContent>
              <CardActions>
                <Button onClick={() => handleJoinTeam(team.id, gameState?.id)}>
                  Join
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Game;
