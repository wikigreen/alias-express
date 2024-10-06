import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { LobbyLayout } from "./layout/LobbyLayout";
import { GameRoomLayout } from "./layout/GameRoomLayout";
import { useMemo } from "react";

const App = () => {
  const router = useMemo(() => {
    return createHashRouter(
      createRoutesFromElements(
        <Route>
          <Route path="/" element={<LobbyLayout />} />
          <Route path="/:roomId" element={<GameRoomLayout />} />
        </Route>,
      ),
    );
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
