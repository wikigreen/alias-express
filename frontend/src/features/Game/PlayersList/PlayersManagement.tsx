import React, { useCallback, useMemo, useState } from "react";
import {
  Backdrop,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { Player } from "../../../context/GameContext/types";
import CloseIcon from "@mui/icons-material/Close";
import { useClearTeamsMutation, useRandomizeTeamsMutation } from "../services";
import { useGameState } from "../../../context/GameContext";
import CopyableField from "../../../components/CopyableField /CopyableField.tsx";
import { useKickPlayerApi } from "../../Room/hooks/useKickPlayerApi.ts";
import { Player as PlayerComponent } from "../Player";

interface PlayersManagementProps {
  isAdmin?: boolean;
  roomId: string;
}

export const PlayersManagement: React.FC<PlayersManagementProps> = ({
  isAdmin = false,
  roomId,
}) => {
  const { gameState, players } = useGameState();
  const [open, setOpen] = useState(false);
  const [randomizeTeams] = useRandomizeTeamsMutation();
  const [clearTeams] = useClearTeamsMutation();
  const kickPlayer = useKickPlayerApi(roomId);

  const isWaitingStatus = useMemo(
    () => gameState?.gameStatus === "waiting",
    [gameState?.gameStatus],
  );

  const gameId = useMemo(() => gameState?.id || "", [gameState?.id]);

  const handleRandomizeTeams = useCallback(async () => {
    const req = {
      roomId,
      gameId,
    };

    try {
      await randomizeTeams(req);
    } catch (error) {
      console.error("Failed to randomize teams:", gameId, error);
    }
  }, [roomId, gameId]);

  const handleClearTeams = useCallback(async () => {
    const req = {
      roomId,
      gameId,
    };

    try {
      await clearTeams(req);
    } catch (error) {
      console.error("Failed to clear teams:", gameId, error);
    }
  }, [roomId, gameId]);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const renderPlayer: (player: Player) => React.ReactNode = ({
    nickname,
    online,
    isAdmin,
  }) => (
    <PlayerComponent
      key={nickname}
      nickname={nickname}
      icon={isAdmin ? <AdminPanelSettingsIcon /> : <AccountCircleIcon />}
      online={online}
      isAdmin={isAdmin}
      onKick={kickPlayer}
    />
  );

  return (
    <>
      <Badge badgeContent={players?.length || 0} color="success">
        <Button type="button" variant="contained" onClick={handleClick}>
          Players
        </Button>
      </Badge>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.snackbar + 1 })}
        open={open}
      >
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Card sx={{ padding: "12px", maxWidth: "500px" }}>
            <CardActions sx={{ justifyContent: "space-between" }}>
              <Typography variant="h6">Players</Typography>
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </CardActions>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                padding: 1,
              }}
            >
              {[
                ...(players || []).sort((a, b) => {
                  if (a.online === b.online) return 0;
                  return -a.online;
                }),
              ].map(renderPlayer)}
            </Box>
            <CardActions
              sx={{
                justifyContent: "space-between",
                flexDirection: "column",
                marginTop: "16px",
                gap: 1,
              }}
            >
              <Typography variant="h6">
                Invite friends using the link!
              </Typography>
              <CopyableField
                valueToCopy={window.location.href.replace(/^https?:\/\//, "")}
              />
              <Box display={isAdmin ? "flex" : "none"} gap={1}>
                <Button
                  variant="contained"
                  onClick={handleRandomizeTeams}
                  disabled={!isWaitingStatus}
                >
                  Randomize Teams
                </Button>
                <Button
                  variant="contained"
                  onClick={handleClearTeams}
                  disabled={!isWaitingStatus}
                >
                  Reset Teams
                </Button>
              </Box>
            </CardActions>
          </Card>
        </Snackbar>
      </Backdrop>
    </>
  );
};
