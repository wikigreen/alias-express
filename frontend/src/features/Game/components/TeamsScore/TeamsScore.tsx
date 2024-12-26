import { Card, CardContent, Typography, Chip } from "@mui/material";
import { FC } from "react";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";

interface TeamProps {
  name?: string;
  score?: number;
}

export const TeamsScore: FC<TeamProps> = ({ name = "None", score = 0 }) => {
  return (
    <Card sx={{ width: "100%" }}>
      <CardContent
        style={{ display: "flex", alignItems: "center", padding: 8 }}
      >
        <Typography variant="h6" style={{ marginLeft: 8, flex: 1 }}>
          {name}
        </Typography>
        <Chip
          icon={<LeaderboardOutlinedIcon />}
          label={score}
          variant="outlined"
        />
      </CardContent>
    </Card>
  );
};
