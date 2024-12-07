import { AliasGameState, GameSettings, Team } from "./types";
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

    // Initialize the game state (no players yet, empty teams)
    const gameState: Partial<AliasGameState> = {
      currentWord: null,
      remainingTime: gameSettings.roundTime,
      gameSettings,
      gameStatus: "waiting",
      roundStartedAt: null,
    };

    // Save game metadata (excluding teams)
    await gameRepository.saveGameMetadata(gameId, gameState);
    roomService.setGameId(roomId, gameId);

    // Copy words from the global 'simpleWords' list to the game's word list
    const words = await gameRepository.getSimpleWords();
    await gameRepository.copyWordsToGame(gameId, words);
    await this.addTeamToGame(gameId);
    await this.addTeamToGame(gameId);

    this.getFullGameState(gameId).then((state) =>
      socketio.to(roomId).emit("gameState", state),
    );

    return gameId; // Return the unique game ID
  }

  async addTeamToGame(gameId: string): Promise<void> {
    const teamId = uuid(); // Generate a unique team ID

    const team: Team = {
      id: teamId,
      players: [], // No players initially
      describer: "", // No describer yet
      score: 0, // Initial score is 0
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

    return game;
  }
}

export const gameService = new GameService();
