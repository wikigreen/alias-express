import { Server } from "socket.io";
import { Player } from "../room/types";
import { parse as parseCookies } from "cookie";
import { roomService } from "../room/roomService";
import { createServer } from "node:http";
import { gameService } from "../game/gameService";

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

      if (state) {
        socket.join(state.id);
        socketio.to(playerId).emit("gameState", state);
        socketio
          .to(playerId)
          .emit("isActivePlayer", state?.currentPlayer === playerId);
        if (state.currentTeam != null) {
          await gameService.emitGuesses(state.id, state.currentTeam, playerId);
        }
      }
    });

    socket.on("disconnect", () => {
      if (!player.id || !player.roomId) {
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
