import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GameSettings, JoinTeamRequest } from "../types";

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/game" }),
  endpoints: (builder) => ({
    getWord: builder.query<
      { word: string },
      { roomId?: string; gameId?: string; round: number }
    >({
      query: (body) => ({
        url: "word",
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
      { word: string },
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
            console.log({ productIds });
            productIds
              .filter((p) => p.gameId === gameId && p.roomId === roomId)
              .forEach((p) => {
                console.log({ updateQueryData: p, data });
                dispatch(
                  gameApi.util.updateQueryData("getWord", p, (prev) => {
                    Object.assign(prev, data);
                  }),
                );
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
  useGetWordQuery,
} = gameApi;
