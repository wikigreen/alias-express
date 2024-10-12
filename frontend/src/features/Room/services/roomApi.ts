import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GetRoomResponse, Room } from "../types";

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
        //TODO: replace with pessimistic update
        invalidatesTags: ["ROOM"],
      },
    ),
  }),
});

export const {
  useGetRoomQuery,
  useCreateRoomMutation,
  useConnectToRoomMutation,
} = roomApi;
