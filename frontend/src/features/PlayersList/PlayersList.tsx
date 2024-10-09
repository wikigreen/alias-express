import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useGameState } from "../../context/GameContext";

export const PlayersList: React.FC = () => {
  const { players } = useGameState();

  console.log(players);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nickname</TableCell>
              <TableCell align="right">Room ID</TableCell>
              <TableCell align="right">Online</TableCell>
              <TableCell align="right">Admin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players && players.length > 0 ? (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.nickname}</TableCell>
                  <TableCell align="right">{player.roomId}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: player.online ? "green" : "red" }}
                  >
                    {player.online ? "Yes" : "No"}
                  </TableCell>
                  <TableCell align="right">
                    {player.isAdmin ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography align="center">No players available</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
