import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { roomApi } from "../features/Room/services";

export const store = configureStore({
  reducer: {
    [roomApi.reducerPath]: roomApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(roomApi.middleware),
});

setupListeners(store.dispatch);
