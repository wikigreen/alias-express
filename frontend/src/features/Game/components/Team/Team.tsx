import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Chip,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CardActions,
} from "@mui/material";
import { FC } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import PersonIcon from "@mui/icons-material/Person";
import clsx from "clsx";

interface TeamProps {
  id?: string;
  name?: string;
  score?: number;
  describer?: string;
  players?: string[];
  onJoin?: () => void;
  onArrowClick?: () => void;
  expanded: boolean;
}

export const Team: FC<TeamProps> = ({
  name = "None",
  score = 0,
  players = [],
  onJoin,
  expanded,
  onArrowClick,
}) => {
  return (
    <Card sx={{ width: "100%" }}>
      <CardContent
        style={{ display: "flex", alignItems: "center", padding: 8 }}
      >
        <IconButton
          onClick={onArrowClick}
          className={clsx({ expanded: expanded })}
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ExpandMoreIcon />
        </IconButton>

        <Typography variant="h6" style={{ marginLeft: 8, flex: 1 }}>
          {name}
        </Typography>

        <Box display="flex" gap={1}>
          <Chip
            icon={<PersonIcon />}
            label={players.length}
            variant="outlined"
          />
          <Chip
            icon={<LeaderboardOutlinedIcon />}
            label={score}
            variant="outlined"
          />
        </Box>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <List>
            {players.map((member) => (
              <ListItem key={member}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary={member} />
              </ListItem>
            ))}
          </List>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: 16 }}
            onClick={onJoin}
          >
            Join
          </Button>
        </CardActions>
      </Collapse>
    </Card>
  );
};
