import { redisClient } from "../redis";
import { Guess } from "./types";
import { parseObjectValues, stringifyObjectValues } from "../utils";
import { v4 as uuid } from "uuid";

class RoundRepository {
  private readonly redisPrefix = "round:";
  private readonly redisGamePrefix = "game:";
  private readonly roundFinishersPlayers = "roundFinishersPlayers";
  private readonly roundFinishersTeams = "roundFinishersTeams";

  async saveGuess(
    roundId: string,
    teamId: string,
    gameId: string,
    guess: Partial<Guess> = {},
  ): Promise<void> {
    const client = await redisClient;

    await client.hSet(
      `${this.redisGamePrefix}${gameId}:${this.redisPrefix}${roundId}:team:${teamId}`,
      stringifyObjectValues({ [uuid()]: guess }),
    );
  }

  async updateGuess(
    gameId: string,
    roundId: string,
    teamId: string,
    { id, guessed, word }: Partial<Guess>,
  ): Promise<void> {
    if (id == null) {
      return;
    }
    const client = await redisClient;
    const roundData = await client.hGet(
      `${this.redisGamePrefix}${gameId}:${this.redisPrefix}${roundId}:team:${teamId}`,
      id,
    );
    if (!roundData) {
      return;
    }
    const oldGuess = JSON.parse(roundData) as Partial<Guess>;
    await client.hSet(
      `${this.redisGamePrefix}${gameId}:${this.redisPrefix}${roundId}:team:${teamId}`,
      stringifyObjectValues({
        [id]: {
          ...oldGuess,
          ...(guessed != null ? { guessed } : {}),
          ...(word != null ? { word } : {}),
        },
      }),
    );
  }

  async getGuessesOfRoundByTeam(
    gameId: string,
    roundId: string | number,
    teamId: string,
  ): Promise<Guess[]> {
    const client = await redisClient;
    const roundData = await client.hGetAll(
      `${this.redisGamePrefix}${gameId}:${this.redisPrefix}${roundId}:team:${teamId}`,
    );
    const guessesMap = parseObjectValues(roundData) as Record<string, Guess>;

    return Object.entries(guessesMap || {}).map(([id, guess]) => ({
      ...guess,
      id,
    }));
  }

  async getRoundsByTeam(
    gameId: string,
    teamId: string,
  ): Promise<Record<number, Guess[]>> {
    const roundIds = await this.getAllRoundIdsForGame(gameId);
    const rounds: Record<number, Guess[]> = {};

    for (const roundId of roundIds) {
      const roundData = await this.getGuessesOfRoundByTeam(
        gameId,
        roundId,
        teamId,
      );
      if (roundData) {
        rounds[roundId] = roundData;
      }
    }

    return rounds;
  }

  async getAllRoundsGrouped(
    gameId: string,
  ): Promise<Record<string, Record<string, Guess[]>>> {
    const client = await redisClient;
    const roundIds = await this.getAllRoundIdsForGame(gameId);
    const groupedRounds: Record<string, Record<string, Guess[]>> = {};

    for (const roundId of roundIds) {
      const teamKeys = await client.keys(
        `${this.redisGamePrefix}${gameId}:${this.redisPrefix}${roundId}:team:*`,
      );

      groupedRounds[roundId] = {};
      for (const teamKey of teamKeys) {
        const teamId = teamKey.split(":").pop();
        if (teamId) {
          groupedRounds[roundId][teamId] = await this.getGuessesOfRoundByTeam(
            gameId,
            roundId,
            teamId,
          );
        }
      }
    }

    return groupedRounds;
  }

  async deleteRound(
    gameId: string,
    roundId: string,
    teamId: string,
  ): Promise<void> {
    const client = await redisClient;

    await client.del(
      `${this.redisGamePrefix}${gameId}:${this.redisPrefix}${roundId}:team:${teamId}`,
    );
  }

  // Add a player to the set of round finishers
  async addPlayerToRoundFinishers(teamId: string, playerId: string) {
    const client = await redisClient;
    await client.sAdd(`${this.roundFinishersPlayers}:${teamId}`, playerId);
  }

  // Check if a player is in the set of round finishers
  async isPlayerInRoundFinishers(teamId: string, playerId: string) {
    const client = await redisClient;
    return await client.sIsMember(
      `${this.roundFinishersPlayers}:${teamId}`,
      playerId,
    );
  }

  // Add a team to the set of round finishers
  async addTeamToRoundFinishers(gameId: string, teamId: string) {
    const client = await redisClient;
    await client.sAdd(`${this.roundFinishersTeams}:${gameId}`, teamId);
  }

  // Check if a team is in the set of round finishers
  async isTeamInRoundFinishers(gameId: string, teamId: string) {
    const client = await redisClient;
    return await client.sIsMember(
      `${this.roundFinishersTeams}:${gameId}`,
      teamId,
    );
  }

  // Clear the set of round finishers for players
  async clearRoundFinishersPlayers(teamId: string) {
    const client = await redisClient;
    await client.del(`${this.roundFinishersPlayers}:${teamId}`);
  }

  // Clear the set of round finishers for teams
  async clearRoundFinishersTeams(gameId: string) {
    const client = await redisClient;
    await client.del(`${this.roundFinishersTeams}:${gameId}`);
  }

  async setRoundNumber(gameId: string, roundNum: number): Promise<void> {
    const client = await redisClient;
    await client.set(`currentRoundNum:${gameId}`, roundNum);
  }

  async getRoundNumber(gameId: string): Promise<number> {
    const client = await redisClient;
    return Number(await client.get(`currentRoundNum:${gameId}`));
  }

  async incrementAndGetRoundNumber(gameId: string) {
    const client = await redisClient;
    await client.incr(`currentRoundNum:${gameId}`);
    return await client.get(`currentRoundNum:${gameId}`);
  }

  async getAllRoundIdsForGame(gameId: string) {
    const currentRound = await this.getRoundNumber(gameId);
    return this.#numberRange(1, currentRound + 1);
  }

  #numberRange(start: number, end: number) {
    if (isNaN(start) || isNaN(end)) {
      return [];
    }
    return new Array(end - start).fill(0).map((d, i) => i + start);
  }
}

export const roundRepository = new RoundRepository();
