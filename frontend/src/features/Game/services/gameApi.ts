import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GameSettings, JoinTeamRequest } from "../types";

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/game" }),
  endpoints: (builder) => ({
    createGame: builder.mutation<void, GameSettings>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
    }),
    joinTeam: builder.mutation<void, JoinTeamRequest>({
      query: (body) => ({
        url: "team",
        method: "POST",
        body,
      }),
    }),
    startGame: builder.mutation<void, { roomId: string; gameId: string }>({
      query: (body) => ({
        url: "start",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateGameMutation, useJoinTeamMutation, useStartGameMutation } = gameApi;
