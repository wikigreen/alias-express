import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GetRoomResponse, Room } from "../types";
import { transformErrorResponse } from "../../../utils/errorHandler.ts";

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/room" }),
  tagTypes: ["ROOM"],
  endpoints: (builder) => ({
    getRoom: builder.query<GetRoomResponse, string>({
      query: (roomId) => `/${roomId}`,
      providesTags: ["ROOM"],
    }),
    createRoom: builder.mutation<Room, void>({
      query: () => ({
        url: "",
        method: "POST",
      }),
    }),
    connectToRoom: builder.mutation<Room, { roomId: string; nickname: string }>(
      {
        query: ({ roomId, nickname }) => ({
          url: `/${roomId}`,
          body: { nickname },
          method: "POST",
        }),
        invalidatesTags: (_: unknown, error) => (error ? [] : ["ROOM"]),
        transformErrorResponse,
      },
    ),
    kickPlayer: builder.mutation<
      Room,
      { roomId: string; playerNickname: string }
    >({
      query: ({ roomId, playerNickname }) => ({
        url: `/player/${roomId}`,
        body: { playerNickname, roomId },
        method: "DELETE",
      }),
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetRoomQuery,
  useCreateRoomMutation,
  useConnectToRoomMutation,
  useKickPlayerMutation,
} = roomApi;
