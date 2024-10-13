import React from "react";
import { Badge, Box, Button, Chip, Popper } from "@mui/material";
import { useGameState } from "../../context/GameContext";

export const PlayersList: React.FC = () => {
  const { players } = useGameState();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

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
            ...players.sort((a, b) => {
              if (a.online === b.online) return 0;
              return -a.online;
            }),
          ].map(({ nickname, online }) => (
            <Chip
              key={nickname}
              label={nickname}
              sx={{
                opacity: online ? 1 : 0.2,
                backgroundColor: online ? "green" : "grey",
                color: "white",
              }}
            />
          ))}
        </Box>
      </Popper>
    </>
  );
};
