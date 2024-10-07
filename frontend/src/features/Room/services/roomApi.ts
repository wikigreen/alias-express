import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Room } from "../types/Room.ts";

export const roomApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/room" }),
  endpoints: (builder) => ({
    getRoom: builder.query<Room, string>({
      query: (roomId) => `/${roomId}`,
    }),
    createRoom: builder.mutation<Room, void>({
      query: () => ({
        url: "",
        method: "POST",
      }),
    }),
  }),
});

export const { useGetRoomQuery, useCreateRoomMutation } = roomApi;
