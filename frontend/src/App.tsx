import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { LobbyLayout } from "./layout/LobbyLayout";
import { GameRoomLayout } from "./layout/GameRoomLayout";
import { useMemo, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { TopNav } from "./components";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5",
      paper: "#f5f5f5",
    },
  },
});

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const storedPreference = localStorage.getItem("darkMode");
    return storedPreference
      ? (JSON.parse(storedPreference) as boolean)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const handleThemeChange = () => {
    setDarkMode((prevMode: boolean) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  const router = useMemo(() => {
    return createHashRouter(
      createRoutesFromElements(
        <Route
          element={
            <TopNav darkMode={darkMode} handleThemeChange={handleThemeChange} />
          }
        >
          <Route path="/" element={<LobbyLayout />} />
          <Route path="/:roomId" element={<GameRoomLayout />} />
        </Route>,
      ),
    );
  }, [darkMode]);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ThemeProvider>
  );
};

export default App;
