import { AliasGameState, GameSettings, GameStatus, Team } from "./types";
import { v4 as uuid } from "uuid";
import { gameRepository } from "./gameRespository";
import { socketio } from "../index";
import { roomService } from "../room/roomService";
import { Optional } from "../utils";

class GameService {
  // Create a new game with a unique gameId and copy words from the global list
  async createGame({
    roomId,
    ...gameSettings
  }: GameSettings & { roomId: string }): Promise<string> {
    const gameId = uuid(); // Generate a unique game ID

    const gameState: Partial<AliasGameState> = {
      gameSettings,
      gameStatus: "waiting",
      currentRound: 1,
    };

    // Save game metadata (excluding teams)
    await gameRepository.saveGameMetadata(gameId, gameState);
    await roomService.setGameId(roomId, gameId);

    // Copy words from the global 'simpleWords' list to the game's word list
    const words = await gameRepository.getSimpleWords();
    await gameRepository.copyWordsToGame(gameId, words);
    await this.addTeamToGame(roomId, gameId, { name: "Team A" });
    await this.addTeamToGame(roomId, gameId, { name: "Team B" });

    await this.#emitGameState(roomId, gameId);

    return gameId; // Return the unique game ID
  }

  async addTeamToGame(
    roomId: string,
    gameId: string,
    teamSettings: Partial<Team> = {},
  ): Promise<void> {
    const teamId = uuid(); // Generate a unique team ID

    const team: Team = {
      id: teamId,
      players: [],
      describer: "",
      score: 0,
      name: teamId,
      ...teamSettings,
    };

    await gameRepository.saveTeam(gameId, team);
    await this.#emitGameState(roomId, gameId);
  }

  async popNextWord(gameId: string): Promise<string | null> {
    return await gameRepository.popNextWord(gameId);
  }

  async getFullGameState(
    gameId: Optional<string>,
  ): Promise<AliasGameState | null> {
    if (!gameId) {
      return null;
    }

    const game = await gameRepository.getGame(gameId);
    if (!game) {
      return null;
    }

    const { teamId: currentTeam, playerId: currentPlayer } =
      await this.getActivePlayer(gameId);

    return {
      ...game,
      currentTeam,
      currentPlayer,
    };
  }

  async getActivePlayer(
    gameId: string,
  ): Promise<{ teamId: string | null; playerId: string | null }> {
    const gameStatus = await this.getGameStatus(gameId);
    if (
      gameStatus &&
      new Set<GameStatus>(["waiting", "completed"]).has(gameStatus)
    ) {
      return { teamId: null, playerId: null };
    }

    const teamId = await gameRepository.getFirstTeamId(gameId);
    const playerId = await gameRepository.getFirstPlayerId(gameId, teamId);
    return { teamId, playerId };
  }

  async joinTeam(roomId: string, teamId: string, playerId: string) {
    const gameId = await gameRepository.getGameIdForTeamId(teamId);
    const teams = await gameRepository.getTeamIds(gameId);
    for (const tId of teams) {
      await gameRepository.removePlayerFromTeam(gameId, tId, playerId);
    }
    await gameRepository.addPlayerToTeam(gameId, teamId, playerId);

    await this.#emitGameState(roomId, gameId);
  }

  async getTeams(gameId: string): Promise<Team[]> {
    const teamsId = await gameRepository.getTeamIds(gameId);
    const teams = [];
    for (const teamId of teamsId) {
      const team = await gameRepository.getTeam(gameId, teamId);
      teams.push(team);
    }
    return teams;
  }

  async startGame(roomId: string, gameId: string) {
    if (!roomId || !gameId) {
      return;
    }

    const gameStatus = await this.getGameStatus(gameId);
    if (gameStatus !== "waiting") {
      return;
    }

    await gameRepository.saveGameMetadata(gameId, {
      gameStatus: "ongoing",
    });

    await this.#emitGameState(roomId, gameId);
  }

  async startRound(
    roomId: string,
    gameId: string,
    playerId: string,
  ): Promise<boolean> {
    if (!roomId || !gameId) {
      return false;
    }
    const gameStatus = await this.getGameStatus(gameId);

    const { playerId: activePlayerId } = await this.getActivePlayer(gameId);

    if (playerId !== activePlayerId) {
      return false;
    }

    if (gameStatus === "ongoingRound") {
      return true;
    }

    const teams = await this.getTeams(gameId);

    if (teams.length < 2) {
      return false;
    }

    const hasEmptyTeam = teams.some((v) => v.players?.length < 1);
    if (hasEmptyTeam) {
      return false;
    }

    await gameRepository.saveGameMetadata(gameId, {
      gameStatus: "ongoingRound",
    });

    this.#emitGameState(roomId, gameId).then((state) => {
      setTimeout(
        () => this.#endRound(roomId, gameId),
        (state?.gameSettings?.roundTime || 60) * 1000,
      );
    });
    return true;
  }

  async finishRound(
    roomId: string,
    gameId: string,
    playerId: string,
  ): Promise<boolean> {
    if (!roomId || !gameId) {
      return false;
    }
    const gameStatus = await this.getGameStatus(gameId);

    const { playerId: activePlayerId } = await this.getActivePlayer(gameId);

    if (playerId !== activePlayerId) {
      return false;
    }

    if (gameStatus === "ongoing") {
      return true;
    }

    await gameRepository.saveGameMetadata(gameId, {
      gameStatus: "ongoing",
    });

    await this.#emitGameState(roomId, gameId);
    return true;
  }

  async #endRound(roomId: string, gameId: string): Promise<void> {
    await gameRepository.saveGameMetadata(gameId, {
      gameStatus: "lastWord",
    });
    await this.#emitGameState(roomId, gameId);
  }

  async getGameStatus(gameId: string): Promise<GameStatus | null> {
    return await gameRepository.getGameStatus(gameId);
  }

  async #emitGameState(
    roomId: string,
    gameId: string,
  ): Promise<AliasGameState | null> {
    return this.getFullGameState(gameId).then((state) => {
      socketio.to(roomId).emit("gameState", state);
      roomService.getPlayers(roomId, false).then((players) => {
        players
          .map((p) => p.id)
          .forEach((pId) => {
            if (!pId) return;
            socketio
              .to(pId)
              .emit("isActivePlayer", state?.currentPlayer === pId);
          });
      });
      return state;
    });
  }
}

export const gameService = new GameService();
