import React, { useState } from "react";
import {
  Backdrop,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  Chip,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useGameState } from "../../context/GameContext";
import { Player } from "../../context/GameContext/types";
import CloseIcon from "@mui/icons-material/Close";
import CopyableField from "../../components/CopyableField /CopyableField.tsx";

export const PlayersList: React.FC = () => {
  const { players } = useGameState();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const renderPlayer: (player: Player) => React.ReactNode = ({
    nickname,
    online,
    isAdmin,
  }) => (
    <Chip
      key={nickname}
      label={nickname}
      icon={isAdmin ? <AdminPanelSettingsIcon /> : <AccountCircleIcon />}
      color={online ? "success" : "default"}
      variant={online ? "filled" : "outlined"}
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
              }}
            >
              <Typography variant="h6">
                Invite friends using this the link!
              </Typography>
              <CopyableField
                valueToCopy={window.location.href.replace(/^https?:\/\//, "")}
              />
            </CardActions>
          </Card>
        </Snackbar>
      </Backdrop>
    </>
  );
};
