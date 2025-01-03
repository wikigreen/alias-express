import { AliasGameState, GameSettings, GameStatus, Team } from "./types";
import { redisClient } from "../redis";
import { parseObjectValues, stringifyObjectValues } from "../utils";

class GameRepository {
  private readonly redisPrefix = "game:";

  // Save the game metadata (without the teams)
  async saveGameMetadata(
    gameId: string,
    gameData: Partial<AliasGameState>,
  ): Promise<void> {
    const client = await redisClient;

    await client.hSet(
      `${this.redisPrefix}${gameId}`,
      stringifyObjectValues(gameData),
    );
  }

  // Save a specific team in the game
  async saveTeam(gameId: string, team: Team): Promise<void> {
    const client = await redisClient;
    client.rPush(`${this.redisPrefix}${gameId}:teams`, team.id);
    await client.hSet(
      `${this.redisPrefix}${gameId}:team:${team.id}$`,
      stringifyObjectValues(team),
    );
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
    const teamKeys = await client.lRange(
      `${this.redisPrefix}${gameId}:teams`,
      0,
      -1,
    );
    const teams: Team[] = await Promise.all(
      teamKeys.map(async (key) => {
        const teamId = key.split(":").pop()?.replace("$", ""); // Extract teamId from key
        return await this.getTeam(gameId, teamId!);
      }),
    );

    return {
      ...(parseObjectValues(gameData) as AliasGameState),
      id: gameId,
      teams,
    };
  }

  // Fetch the full game state, including current word, teams, etc.
  async getGameStatus(gameId: string): Promise<GameStatus | null> {
    const client = await redisClient;

    const gameStatusJson = await client.hGet(
      `${this.redisPrefix}${gameId}`,
      "gameStatus",
    );

    return (JSON.parse(gameStatusJson!) as GameStatus) || null;
  }

  // Fetch the full game state, including current word, teams, etc.
  async getGameSettings(gameId: string): Promise<GameSettings | null> {
    const client = await redisClient;

    const gameStatusJson = await client.hGet(
      `${this.redisPrefix}${gameId}`,
      "gameSettings",
    );

    return (JSON.parse(gameStatusJson!) as GameSettings) || null;
  }

  // Get a team by ID
  async getTeam(gameId: string, teamId: string): Promise<Team> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    const teamData = await client.hGetAll(`${teamKey}$`);
    const players = await client.lRange(`${teamKey}:players`, 0, -1); // Fetch players from Redis list

    return {
      ...(parseObjectValues(teamData) as Team),
      id: teamId,
      players,
    };
  }

  // Get a team by ID
  async getFirstTeamId(gameId: string): Promise<string> {
    const client = await redisClient;
    const teamsKey = `${this.redisPrefix}${gameId}:teams`;

    return (await client.lRange(teamsKey, 0, 0))?.[0];
  }

  async moveLastTeamToBeginningAndGet(gameId: string): Promise<string | null> {
    const client = await redisClient;
    const teamsKey = `${this.redisPrefix}${gameId}:teams`;

    return await client.rPopLPush(teamsKey, teamsKey);
  }

  // Get a team by ID
  async getFirstPlayerId(gameId: string, teamId: string): Promise<string> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    const players = await client.lRange(`${teamKey}:players`, 0, 0); // Fetch players from Redis list

    return players?.[0];
  }

  async moveLastPlayerToBeginningAndGet(
    gameId: string,
    teamId: string,
  ): Promise<string | null> {
    const client = await redisClient;
    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    return await client.rPopLPush(`${teamKey}:players`, `${teamKey}:players`);
  }

  async getTeamIds(gameId: string): Promise<string[]> {
    const client = await redisClient;
    return await client.lRange(`${this.redisPrefix}${gameId}:teams`, 0, -1);
  }

  // Get a team by ID
  async getGameIdForTeamId(teamId: string): Promise<string> {
    const teamKey = `${this.redisPrefix}*:team:${teamId}$`;

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
  ): Promise<boolean> {
    const client = await redisClient;

    const teamKey = `${this.redisPrefix}${gameId}:team:${teamId}`;

    // Remove player from the Redis list
    const deleted = await client.lRem(`${teamKey}:players`, 0, playerId); // 0 means remove all occurrences
    return !!deleted;
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
