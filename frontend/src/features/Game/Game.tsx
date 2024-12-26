import React, { useCallback, useMemo, useState } from "react";
import GameForm from "./CreateGame/GameForm.tsx";
import { GameStatus, useGameState } from "../../context/GameContext";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Drawer,
  IconButton,
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
import MenuIcon from "@mui/icons-material/Menu";
import { Round } from "./components/Round";
import { Guesses } from "./components/Guesses";
import { GameInfo } from "./components/GameInfo";

interface GameFormProps {
  roomId: string;
  isAdmin: boolean;
}

const Game: React.FC<GameFormProps> = ({ roomId, isAdmin }) => {
  const [open, setOpen] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string>();

  const { gameState, isActivePlayer, score, remainingTime, guesses } =
    useGameState();
  const [joinTeam] = useJoinTeamMutation();
  const [startGame] = useStartGameMutation();
  const [startRound] = useStartRoundMutation();
  const [finishRound] = useFinishRoundMutation();
  const [makeGuess] = useMakeGuessMutation();
  const { data: { word } = {} } = useGetWordQuery(
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

  const currentTeamName = useMemo(() => {
    return gameState?.teams
      .filter(({ id }) => gameState?.currentTeam === id)
      .map(({ name }) => name)?.[0];
  }, [gameState?.teams, gameState?.currentTeam]);

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

  const toggleDrawer = useCallback(() => {
    setOpen((prev: boolean) => !prev);
  }, [setOpen]);

  const waiting = useMemo(() => {
    if (gameState?.gameStatus !== "waiting") {
      return null;
    }

    return (
      <Card sx={{ padding: 2 }}>
        <CardContent sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h6">You are not in the team yet</Typography>
        </CardContent>
        <CardActions sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: 16 }}
            onClick={toggleDrawer}
          >
            Join team
          </Button>
        </CardActions>
      </Card>
    );
  }, [gameState?.gameStatus]);

  if (!gameState) {
    return <GameForm isAdmin={isAdmin} roomId={roomId} />;
  }

  if (gameState.gameStatus === "completed") {
    const { name } =
      gameState.teams?.filter(({ id }) => gameState.winnerTeamId === id)?.[0] ||
      {};
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Winner is {name}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <IconButton aria-label="menu" size="large" onClick={toggleDrawer}>
        <MenuIcon fontSize="inherit" />
      </IconButton>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: "80vw",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {isAdmin ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleStartGame(gameState?.id)}
            >
              Start game
            </Button>
          ) : null}
          {gameState.teams.map((team) => (
            <Team
              expanded={team.id === expandedTeam}
              onArrowClick={() =>
                setExpandedTeam((prev) => {
                  if (prev === team.id) {
                    return "";
                  }
                  return team.id;
                })
              }
              key={team.id}
              name={team.name}
              id={team.id}
              score={score[team.id]}
              players={team.players}
              describer={team.describer}
              onJoin={() => handleJoinTeam(team.id, gameState?.id)}
            />
          ))}
        </Box>
      </Drawer>
      {waiting}
      <GameInfo
        currentRound={gameState?.currentRound}
        currentTeam={currentTeamName || "No team yet"}
        playerGuessing={gameState.currentPlayer || "No player yet"}
        remainingTime={remainingTime?.toString() || ""}
        scoreToWin={gameState.gameSettings.winningScore}
        teamScore={score[gameState.currentTeam || ""]}
      />
      {isActivePlayer ? (
        <Round
          status={gameState?.gameStatus}
          onFinishRound={() => handleFinishRound(gameState?.id)}
          onGuess={() => handleMakeGuess(gameState?.id, true)}
          onSkip={() => handleMakeGuess(gameState?.id, false)}
          onStartRound={() => handleStartRound(gameState?.id)}
          currentWord={word}
        />
      ) : null}
      <Guesses guesses={guesses} />
    </Box>
  );
};

export default Game;
