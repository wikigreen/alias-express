import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { FC, PropsWithChildren } from "react";

interface TeamProps {
  id?: string;
  name?: string;
  score?: number;
  describer?: string;
  players?: string[];
  onJoin?: () => void;
}

export const Team: FC<PropsWithChildren<TeamProps>> = ({
  children,
  name = "None",
  id = "None",
  score = 0,
  players = [],
  describer = "None",
  onJoin,
}) => (
  <Grid item xs={12} sm={6}>
    <Card>
      <CardContent>
        <Typography variant="subtitle1">Name: {name}</Typography>
        <Typography>ID: {id}</Typography>
        <Typography>
          Score: <strong>{score}</strong>
        </Typography>
        <Typography>
          Describer: <strong>{describer || "None"}</strong>
        </Typography>
        <Typography>Players:</Typography>
        {players.length > 0 ? (
          <ul>
            {players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        ) : (
          <Typography>No players</Typography>
        )}
      </CardContent>
      {onJoin ? (
        <CardActions>
          <Button disabled={!onJoin} onClick={onJoin}>
            Join
          </Button>
        </CardActions>
      ) : null}
    </Card>
    {children}
  </Grid>
);
