import { AliasGameState, GameSettings, GameStatus, Team } from "./types";
import { v4 as uuid } from "uuid";
import { gameRepository } from "./gameRespository";
import { socketio } from "../index";
import { Optional } from "../utils";
import { roomService } from "../room/roomService";

class GameService {
  // Create a new game with a unique gameId and copy words from the global list
  async createGame({
    roomId,
    ...gameSettings
  }: GameSettings & { roomId: string }): Promise<string> {
    const gameId = uuid(); // Generate a unique game ID

    const gameState: Partial<AliasGameState> = {
      currentWord: null,
      remainingTime: gameSettings.roundTime,
      gameSettings,
      gameStatus: "waiting",
      roundStartedAt: null,
    };

    // Save game metadata (excluding teams)
    await gameRepository.saveGameMetadata(gameId, gameState);
    await roomService.setGameId(roomId, gameId);

    // Copy words from the global 'simpleWords' list to the game's word list
    const words = await gameRepository.getSimpleWords();
    await gameRepository.copyWordsToGame(gameId, words);
    await this.addTeamToGame(gameId, { name: "Team A" });
    await this.addTeamToGame(gameId, { name: "Team B" });

    this.getFullGameState(gameId).then((state) =>
      socketio.to(roomId).emit("gameState", state),
    );

    return gameId; // Return the unique game ID
  }

  async addTeamToGame(
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
    this.getFullGameState(gameId).then((state) =>
      socketio.to(gameId).emit("gameState", state),
    );
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
      await this.getActivePlayer(game?.gameStatus, gameId);

    return {
      ...game,
      currentTeam,
      currentPlayer,
    };
  }

  async getActivePlayer(
    gameStatus: GameStatus,
    gameId: string,
  ): Promise<{ teamId: string | null; playerId: string | null }> {
    if (new Set<GameStatus>(["waiting", "completed"]).has(gameStatus)) {
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

    this.getFullGameState(gameId).then((state) =>
      socketio.to(roomId).emit("gameState", state),
    );
  }

  async getTeams(gameId: string): Promise<Team[]> {
    const teamsId = await gameRepository.getTeamIds(gameId);
    const teams = [];
    for (const teamId in teamsId) {
      const team = await gameRepository.getTeam(gameId, teamId);
      teams.push(team);
    }
    return teams;
  }

  async startGame(roomId?: string, gameId?: string) {
    if (!roomId || !gameId) {
      return;
    }

    await gameRepository.saveGameMetadata(gameId, {
      gameStatus: "ongoing",
    });

    this.getFullGameState(gameId).then((state) =>
      socketio.to(roomId).emit("gameState", state),
    );
  }

  async startRound(roomId?: string, gameId?: string): Promise<boolean> {
    if (!roomId || !gameId) {
      return false;
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

    this.getFullGameState(gameId).then((state) =>
      socketio.to(roomId).emit("gameState", state),
    );
    return true;
  }

  async getGameStatus(gameId: string): Promise<GameStatus | null> {
    return await gameRepository.getGameStatus(gameId);
  }
}

export const gameService = new GameService();
