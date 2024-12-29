import { Server } from "socket.io";
import { Player } from "../room/types";
import { parse as parseCookies } from "cookie";
import { roomService } from "../room/roomService";
import { createServer } from "node:http";
import { gameService } from "../game/gameService";
import { roomRepository } from "../room/roomRepository";

export const initSocketIo = (server: ReturnType<typeof createServer>) => {
  const socketio = new Server(server, {
    cors: {
      methods: ["GET", "POST"],
    },
  });

  socketio.on("connection", async (socket) => {
    const { roomId } = socket.handshake.query as Omit<
      Player,
      "id" | "online" | "isAdmin"
    >;
    const { [`room:${roomId}`]: playerId } = parseCookies(
      socket.handshake.headers.cookie || "",
    );

    if (!playerId) {
      socket.disconnect();
      return;
    }

    const player = await roomService.getPlayer(roomId, playerId);

    if (!player) {
      socket.disconnect();
      return;
    }
    socket.join(roomId);
    socket.join(playerId);
    await roomService.updatePlayer({
      id: player.id,
      roomId: roomId,
      online: true,
    });
    await roomService.getPlayers(roomId).then((players) => {
      socketio.to(roomId).emit("playerConnect", players);
    });

    socket.on("connectGame", async () => {
      const currentGameId = (await roomService.getRoom(roomId))?.currentGameId;
      const state = await gameService.getFullGameState(currentGameId);
      const players = (await roomRepository.getPlayers(roomId)).reduce(
        (previousValue, currentValue) => {
          return { ...previousValue, [currentValue.id]: currentValue.nickname };
        },
        {} as Record<string, string>,
      );

      const safeState = state
        ? {
            ...state,
            currentPlayer: players[state.currentPlayer || ""],
            teams: (state.teams || []).map((team) =>
              Object.assign(team, {
                players: team.players.map((playerId) => players[playerId]),
              }),
            ),
          }
        : null;

      if (state) {
        socket.join(state.id);
        socketio.to(playerId).emit("gameState", safeState);
        socketio
          .to(playerId)
          .emit("isActivePlayer", state?.currentPlayer === playerId);
        if (state.currentTeam != null) {
          await gameService.emitGuesses(state.id, state.currentTeam, playerId);
          await gameService.emitScore(state.id, state.currentTeam, playerId);
        }
      }
    });

    socket.on("disconnect", async () => {
      if (!player.id || !player.roomId) {
        return;
      }

      const playerTemtTest = await roomService.getPlayer(roomId, player.id);

      if (!playerTemtTest) {
        return;
      }

      roomService
        .disconnectPlayer(player.id, player.roomId)
        .then(() => {
          socket.leave(roomId);
          socket.leave(playerId);
          return roomService.getPlayers(roomId);
        })
        .then((players) => {
          socketio.to(roomId).emit("playerConnect", players);
        });
    });
  });

  return socketio;
};
