import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { roomApi } from "../features/Room";
import { gameApi } from "../features/Game/services";

export const store = configureStore({
  reducer: {
    [roomApi.reducerPath]: roomApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(roomApi.middleware)
      .concat(gameApi.middleware),
});

setupListeners(store.dispatch);
