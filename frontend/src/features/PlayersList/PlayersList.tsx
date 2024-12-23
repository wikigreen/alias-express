import React from "react";
import { Badge, Box, Button, Chip, Popper } from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useGameState } from "../../context/GameContext";
import { Player } from "../../context/GameContext/types";

export const PlayersList: React.FC = () => {
  const { players } = useGameState();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
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

  const open = Boolean(anchorEl);

  return (
    <>
      <Badge badgeContent={players?.length || 0} color="success">
        <Button type="button" variant="contained" onClick={handleClick}>
          Players
        </Button>
      </Badge>
      <Popper
        open={open}
        anchorEl={anchorEl}
        sx={{
          backgroundColor: "white",
          height: 20,
          width: "fit-content",
          minWidth: 200,
          maxWidth: 450,
          minHeight: 100,
          borderRadius: 4,
          padding: 1,
          boxShadow: "3px 2px 5px #b0b0b0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {[
            ...(players || []).sort((a, b) => {
              if (a.online === b.online) return 0;
              return -a.online;
            }),
          ].map(renderPlayer)}
        </Box>
      </Popper>
    </>
  );
};
