import { FC } from "react";
import { AppBar, Box, Switch, Toolbar, Typography } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Outlet } from "react-router";

interface TopNavProps {
  handleThemeChange: () => void;
  darkMode: boolean;
}

export const TopNav: FC<TopNavProps> = ({ handleThemeChange, darkMode }) => {
  return (
    <Box>
      <AppBar position="static">
        {/* Box to limit the width of the content */}
        <Box
          sx={{
            maxWidth: "1500px",
            width: "100%",
            margin: "0 auto", // Centers the content
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between", // Push Alias to the left and other elements to the right
              alignItems: "center",
            }}
          >
            {/* Left-aligned Alias */}
            <Typography variant="h6" component="div">
              Alias
            </Typography>

            {/* Right-aligned Icons and Switch */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LightModeIcon />
              <Switch
                checked={darkMode}
                onChange={handleThemeChange}
                inputProps={{ "aria-label": "Theme switcher" }}
              />
              <DarkModeIcon />
            </Box>
          </Toolbar>
        </Box>
      </AppBar>
      {/* Content */}
      <Box sx={{ p: 2, maxWidth: "1500px", margin: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
};
