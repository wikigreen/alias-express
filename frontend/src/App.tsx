import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { LobbyLayout } from "./layout/LobbyLayout";
import { GameRoomLayout } from "./layout/GameRoomLayout";
import { useMemo } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";

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

  return (
    <Provider store={store}>
      <RouterProvider router={router} />;
    </Provider>
  );
};

export default App;
