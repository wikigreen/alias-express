import { AliasGameState, Team } from "./types";
import { redisClient } from "../redis";

class GameRepository {
  private readonly redisPrefix = "game:";

  // Save the game metadata (without the teams)
  async saveGameMetadata(
    gameId: string,
    gameData: Partial<AliasGameState>,
  ): Promise<void> {
    const client = await redisClient;
    await client.hSet(`${this.redisPrefix}${gameId}`, {
      currentWord: gameData.currentWord || "",
      currentTeam: gameData.currentTeam || "",
      remainingTime: gameData.remainingTime?.toString() || "0",
      gameStatus: gameData.gameStatus || "",
      roundStartedAt: gameData.roundStartedAt
        ? gameData.roundStartedAt.toISOString()
        : "",
      winningScore: gameData?.gameSettings?.winningScore?.toString() || "",
      roundTime: gameData?.gameSettings?.roundTime?.toString() || "",
    });
  }

  // Save a specific team in the game
  async saveTeam(gameId: string, team: Team): Promise<void> {
    const client = await redisClient;
    // Save the team metadata (score and describer)
    await client.hSet(`${this.redisPrefix}${gameId}:team:${team.id}$`, {
      describer: team.describer,
      score: team.score.toString(),
    });
  }

  // Fetch the list of words from the 'simpleWords' key
  async getSimpleWords(): Promise<string[]> {
    const client = await redisClient;
    const words = await client.lRange("simpleWords", 0, -1); // Get all words
    return words || [];
  }

  // Copy words to the newly created game's word list
  async copyWordsToGame(gameId: string, words: string[]): Promise<void> {
    const client = await redisClient;
    const gameWordsKey = `${this.redisPrefix}${gameId}:words`;
    for (const word of words) {
      await client.rPush(gameWordsKey, word); // Push each word to the new game's word list
    }
  }

  // Pop a word from the game's word list and set it as the currentWord
  async popNextWord(gameId: string): Promise<string | null> {
    const client = await redisClient;
    const gameWordsKey = `${this.redisPrefix}${gameId}:words`;

    // Pop a word from the word list
    const nextWord = await client.lPop(gameWordsKey);

    if (nextWord) {
      // Update currentWord in game metadata
      await client.hSet(`${this.redisPrefix}${gameId}`, {
        currentWord: nextWord,
      });
    }

    return nextWord || null; // Return the next word or null if the list is empty
  }

  // Fetch the full game state, including current word, teams, etc.
  async getGame(gameId: string): Promise<AliasGameState | null> {
    const client = await redisClient;

    // Fetch the game metadata
    const gameData = await client.hGetAll(`${this.redisPrefix}${gameId}`);
    if (Object.keys(gameData).length === 0) {
      return null;
    }

    // Fetch all teams for the game
    const teamKeys = await client.keys(`${this.redisPrefix}${gameId}:team:*$`);
    const teams: Team[] = await Promise.all(
      teamKeys.map(async (key) => {
        const teamId = key.split(":").pop(); // Extract teamId from key
        return await this.getTeam(gameId, teamId!);
      }),
    );

    return {
      teams,
      currentWord: gameData.currentWord || null,
      currentTeam: gameData.currentTeam || "",
      remainingTime: parseInt(gameData.remainingTime, 10),
      gameSettings: {
        winningScore: parseInt(gameData.winningScore, 10),
        roundTime: parseInt(gameData.roundTime, 10),
      },
      gameStatus: gameData.gameStatus as
        | "waiting"
        | "ongoing"
        | "paused"
        | "completed",
      roundStartedAt: gameData.roundStartedAt
        ? new Date(gameData.roundStartedAt)
        : null,
    };
  }

  // Get a team by ID
  async getTeam(gameId: string, teamId: string): Promise<Team> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    const teamData = await client.hGetAll(`${teamKey}$`);
    const players = await client.lRange(`${teamKey}:players`, 0, -1); // Fetch players from Redis list

    return {
      id: teamId,
      players,
      describer: teamData.describer || "",
      score: parseInt(teamData.score, 10) || 0,
    };
  }

  // Get a team by ID
  async getTeamIds(gameId: string): Promise<string[]> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:*$`;
    const teamKeys = await client.keys(teamKey);

    return teamKeys.map((key) => key.split(":")?.[3]);
  }

  // Get a team by ID
  async getGameIdForTeamId(teamId: string): Promise<string> {
    const teamKey = `${this.redisPrefix}*:team:${teamId}`;

    return redisClient.then(async (client) => {
      const res = await client.scan(0, {
        MATCH: teamKey,
        COUNT: 1000,
      });
      const [, gameId] = res?.keys?.[0]?.split(":") || [];
      return gameId;
    });
  }

  // Add a player to a team
  async addPlayerToTeam(
    gameId: string,
    teamId: string,
    playerId: string,
  ): Promise<void> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    // Only add the player if they are not already in the team (check Redis list)
    const playerExists = await client.lPos(`${teamKey}:players`, playerId);
    if (playerExists === null) {
      await client.rPush(`${teamKey}:players`, playerId); // Add player to the list
    }
  }

  // Remove a player from a team
  async removePlayerFromTeam(
    gameId: string,
    teamId: string,
    playerId: string,
  ): Promise<void> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    // Remove player from the Redis list
    await client.lRem(`${teamKey}:players`, 0, playerId); // 0 means remove all occurrences
  }

  // Get all player IDs from a team
  async getAllPlayerIdsFromTeam(
    gameId: string,
    teamId: string,
  ): Promise<string[]> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    // Retrieve all players from the Redis list
    const players = await client.lRange(`${teamKey}:players`, 0, -1);
    return players || [];
  }

  // Check if a player exists in a team
  async isPlayerInTeam(
    gameId: string,
    teamId: string,
    playerId: string,
  ): Promise<boolean> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    // Use lPos to check if the player exists in the list (returns index or null)
    const playerExists = await client.lPos(`${teamKey}:players`, playerId);
    return playerExists !== null;
  }

  // Optional: Clear all players from a team
  async clearTeam(gameId: string, teamId: string): Promise<void> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    // Remove all players from the Redis list
    await client.del(`${teamKey}:players`);
  }

  async removeAndReturnFirstPlayer(
    gameId: string,
    teamId: string,
  ): Promise<string | null> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    // Use LPOP to remove and return the first player from the Redis list
    const playerId = await client.lPop(`${teamKey}:players`);

    return playerId || null; // Return the player ID or null if the list is empty
  }
}

export const gameRepository = new GameRepository();
