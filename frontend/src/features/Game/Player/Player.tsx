import { FC } from "react";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { Box, Button, Popover, Typography } from "@mui/material";

interface PlayerProps {
  nickname: string;
  icon: React.ReactNode;
  online: boolean;
  isAdmin: boolean;
  onKick: (nick: string) => void;
}

export const Player: FC<PlayerProps> = ({
  nickname,
  icon,
  online,
  isAdmin,
  onKick,
}) => {
  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div>
          <Button
            startIcon={icon}
            variant={online ? "contained" : "outlined"}
            style={{ textTransform: "none", borderRadius: 32 }}
            {...bindTrigger(popupState)}
          >
            {nickname}
          </Button>
          <Popover
            {...bindPopover(popupState)}
            sx={(theme) => ({ zIndex: theme.zIndex.snackbar + 1 })}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Box
              sx={{
                p: 1,
                minWidth: "200px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography sx={{ p: 2 }}>{nickname}</Typography>
              <Button
                variant="contained"
                onClick={() => onKick(nickname)}
                disabled={isAdmin}
              >
                Kick
              </Button>
            </Box>
          </Popover>
        </div>
      )}
    </PopupState>
  );
};
