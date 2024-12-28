import React, { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Timer } from "@mui/icons-material";

interface TimerComponentProps {
  currentTime: number; // The current remaining time in seconds
  initialTime: number; // The initial starting time in seconds
}

const TimerComponent: React.FC<TimerComponentProps> = ({
  currentTime,
  initialTime,
}) => {
  const { color, width } = useMemo(() => {
    const color = currentTime < 10 ? "red" : "green";
    const width = (currentTime / initialTime) * 100;
    return { color, width };
  }, [currentTime, initialTime]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 15,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderRadius: 5,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            height: "100%",
            width: `${width}%`,
            backgroundColor: color,
            borderRadius: 5,
            transition: "width 0.2s linear, background-color 0.2s linear",
          }}
        />
      </Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Timer sx={{ color }} />
        <Typography variant="h5" sx={{ color }}>
          <strong>{currentTime > 0 ? currentTime : "Last word"}</strong>
        </Typography>
      </Stack>
    </Box>
  );
};

export default TimerComponent;
