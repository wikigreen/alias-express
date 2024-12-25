import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GameSettings, JoinTeamRequest } from "../types";

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/game" }),
  endpoints: (builder) => ({
    getWord: builder.query<string, { roomId: string; gameId: string }>({
      query: (body) => ({
        url: "guess",
        method: "POST",
        body,
      }),
    }),
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
      string,
      { roomId: string; gameId: string; guessed: boolean }
    >({
      query: (body) => ({
        url: "guess",
        method: "POST",
        body,
      }),
      async onQueryStarted(
        { gameId, roomId },
        { dispatch, queryFulfilled, getState },
      ) {
        const productIds = gameApi.util.selectCachedArgsForQuery(
          getState(),
          "getWord",
        );
        queryFulfilled
          .then(({ data }) => {
            productIds
              .filter((p) => p.gameId === gameId && p.gameId === roomId)
              .forEach((p) => {
                dispatch(gameApi.util.upsertQueryData("getWord", p, data));
              });
          })
          .catch((e) => console.error(e));
      },
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
