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
    startRound: builder.mutation<void, { roomId: string; gameId: string }>({
      query: (body) => ({
        url: "round",
        method: "PATCH",
        body,
      }),
    }),
    finishRound: builder.mutation<void, { roomId: string; gameId: string }>({
      query: (body) => ({
        url: "round/stop",
        method: "PATCH",
        body,
      }),
    }),
    makeGuess: builder.mutation<
      void,
      { roomId: string; gameId: string; guessed: boolean }
    >({
      query: (body) => ({
        url: "guess",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreateGameMutation,
  useJoinTeamMutation,
  useStartGameMutation,
  useStartRoundMutation,
  useFinishRoundMutation,
  useMakeGuessMutation,
} = gameApi;
