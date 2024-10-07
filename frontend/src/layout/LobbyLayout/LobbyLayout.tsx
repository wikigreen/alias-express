import React from "react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { CreateRoomButton } from "../../features/CreateRoomButton/CreateRoomButton.tsx";

export const LobbyLayout: React.FC = () => {
  return (
    <Card
      sx={{
        width: "35rem",
        height: "fit-content",
        margin: "auto",
        position: "absolute",
        inset: 0,
        padding: 2,
        borderRadius: 4,
      }}
      variant="outlined"
    >
      <CardMedia
        sx={{ height: 140 }}
        image="https://placehold.co/600x400"
        title="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h3" component="div">
          Alias
        </Typography>
        <Typography gutterBottom variant="h5" component="div">
          how to play ALIAS?
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Alias is a fun word explanation game that is played in teams of 2 or
          more people. The aim is to make your teammates guess the word you are
          explaining by giving them hints and tips. For each correct guess the
          team moves forward on the game board, and the team that reaches the
          finish space first wins the game!
        </Typography>
        <Box component="br" />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          The Alias product family consists of games for kids, grown-ups,
          families and friends, but the core concept remains the same across the
          range. Find out which one is your favourite!
        </Typography>
      </CardContent>
      <CardActions>
        <CreateRoomButton />
      </CardActions>
    </Card>
  );
};
