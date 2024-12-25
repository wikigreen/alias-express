import React from "react";
import GameForm from "./CreateGame/GameForm.tsx";
import { GameStatus, useGameState } from "../../context/GameContext";
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import {
  useFinishRoundMutation,
  useGetWordQuery,
  useJoinTeamMutation,
  useMakeGuessMutation,
  useStartGameMutation,
  useStartRoundMutation,
} from "./services";
import { JoinTeamRequest } from "./types";
import { Team } from "./components";

interface GameFormProps {
  roomId: string;
  isAdmin: boolean;
}

const Game: React.FC<GameFormProps> = ({ roomId, isAdmin }) => {
  const { gameState, isActivePlayer, score, remainingTime } = useGameState();
  const [joinTeam] = useJoinTeamMutation();
  const [startGame] = useStartGameMutation();
  const [startRound] = useStartRoundMutation();
  const [finishRound] = useFinishRoundMutation();
  const [makeGuess] = useMakeGuessMutation();
  const { data: { word } = {}, isFetching: isWordFetching } = useGetWordQuery(
    {
      gameId: gameState?.id,
      roomId,
      round: gameState?.currentRound || 0,
    },
    {
      skip:
        !gameState?.id ||
        !roomId ||
        !gameState?.currentRound ||
        !new Set<GameStatus>(["ongoingRound", "lastWord"]).has(
          gameState?.gameStatus,
        ),
    },
  );

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

  const handleFinishRound = async (gameId: string) => {
    const req = {
      roomId,
      gameId,
    };

    try {
      await finishRound(req);
    } catch (error) {
      console.error("Failed to start round:", gameId, error);
    }
  };

  const handleMakeGuess = async (gameId: string, guessed: boolean) => {
    const req = {
      roomId,
      gameId,
      guessed,
    };

    try {
      await makeGuess(req);
    } catch (error) {
      console.error("Failed to make guess:", gameId, error);
    }
  };

  if (!gameState) {
    return <GameForm isAdmin={isAdmin} roomId={roomId} />;
  }

  if (gameState.gameStatus === "completed") {
    const { id, name, players, describer } =
      gameState.teams?.filter(({ id }) => gameState.winnerTeamId === id)?.[0] ||
      {};
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Winner is
        </Typography>

        <Team
          name={name}
          id={id}
          score={score[id]}
          players={players}
          describer={describer}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Game
      </Typography>
      <Button onClick={() => handleStartGame(gameState?.id)}>Start game</Button>
      <Button onClick={() => handleStartRound(gameState?.id)}>
        Start round
      </Button>
      <Button onClick={() => handleFinishRound(gameState?.id)}>
        Finish round
      </Button>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Button onClick={() => handleMakeGuess(gameState?.id, true)}>
        Guess work
      </Button>
      <Button onClick={() => handleMakeGuess(gameState?.id, false)}>
        Skip word
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
        <Typography>
          Current round: <strong>{gameState.currentRound}</strong>
        </Typography>
        <Typography>
          Current word: <strong>{isWordFetching ? "Loading..." : word}</strong>
        </Typography>
        <Typography>
          Round remaining time: <strong>{remainingTime}</strong>
        </Typography>
      </CardContent>

      {/* Teams Section */}
      <Typography variant="h6" gutterBottom>
        Teams
      </Typography>
      <Grid container spacing={2}>
        {gameState.teams.map((team) => (
          <Team
            key={team.id}
            name={team.name}
            id={team.id}
            score={score[team.id]}
            players={team.players}
            describer={team.describer}
            onJoin={() => handleJoinTeam(team.id, gameState?.id)}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default Game;
