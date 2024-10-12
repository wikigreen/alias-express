import { AliasGameState, GameSettings, Team } from "./types";
import { v4 as uuid } from "uuid";
import { gameRepository } from "./gameRespository"; // For generating unique IDs

class GameService {
  // Create a new game with a unique gameId and copy words from the global list
  async createGame(gameSettings: GameSettings): Promise<string> {
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

    // Copy words from the global 'simpleWords' list to the game's word list
    const words = await gameRepository.getSimpleWords();
    await gameRepository.copyWordsToGame(gameId, words);
    await this.addTeamToGame(gameId);
    await this.addTeamToGame(gameId);

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
  }

  async popNextWord(gameId: string): Promise<string | null> {
    return await gameRepository.popNextWord(gameId);
  }

  async getFullGameState(gameId: string): Promise<AliasGameState | null> {
    const game = await gameRepository.getGame(gameId);

    if (!game) {
      return null;
    }

    return game;
  }
}

export const gameService = new GameService();
