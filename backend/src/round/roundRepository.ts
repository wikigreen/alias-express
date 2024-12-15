import { redisClient } from "../redis";
import { RoundInfo } from "./types";

class RoundRepository {
  private readonly redisPrefix = "round:";

  // Save a new round
  async saveRound(
    roundId: string,
    teamId: string,
    roundInfo: Partial<RoundInfo>,
  ): Promise<void> {
    const client = await redisClient;

    // Save round metadata
    await client.hSet(
      `${this.redisPrefix}${roundId}:team:${teamId}`,
      stringifyObjectValues(roundInfo),
    );

    // Add round to the team's list of rounds
    await client.sAdd(`${this.redisPrefix}team:${teamId}:rounds`, roundId);

    // Add round to the general round index
    await client.sAdd(`${this.redisPrefix}index`, roundId);
  }

  // Retrieve a specific round's information by roundId and teamId
  async getRoundByTeam(
    roundId: string,
    teamId: string,
  ): Promise<RoundInfo | null> {
    const client = await redisClient;
    const roundData = await client.hGetAll(
      `${this.redisPrefix}${roundId}:team:${teamId}`,
    );
    return roundData ? (parseObjectValues(roundData) as RoundInfo) : null;
  }

  // Retrieve all rounds for a specific team
  async getRoundsByTeam(teamId: string): Promise<Record<string, RoundInfo>> {
    const client = await redisClient;
    const roundIds = await client.sMembers(
      `${this.redisPrefix}team:${teamId}:rounds`,
    );
    const rounds: Record<string, RoundInfo> = {};

    for (const roundId of roundIds) {
      const roundData = await this.getRoundByTeam(roundId, teamId);
      if (roundData) {
        rounds[roundId] = roundData;
      }
    }

    return rounds;
  }

  // Retrieve all round data grouped by round number and teams
  async getAllRoundsGrouped(): Promise<
    Record<string, Record<string, RoundInfo>>
  > {
    const client = await redisClient;
    const roundIds = await client.sMembers(`${this.redisPrefix}index`);
    const groupedRounds: Record<string, Record<string, RoundInfo>> = {};

    for (const roundId of roundIds) {
      const teamKeys = await client.keys(
        `${this.redisPrefix}${roundId}:team:*`,
      );

      groupedRounds[roundId] = {};
      for (const teamKey of teamKeys) {
        const teamId = teamKey.split(":").pop();
        const roundData = await client.hGetAll(teamKey);
        if (teamId && roundData) {
          groupedRounds[roundId][teamId] = parseObjectValues(
            roundData,
          ) as RoundInfo;
        }
      }
    }

    return groupedRounds;
  }

  // Update a specific round
  async updateRound(
    roundId: string,
    teamId: string,
    updates: Partial<RoundInfo>,
  ): Promise<void> {
    const client = await redisClient;

    await client.hSet(
      `${this.redisPrefix}${roundId}:team:${teamId}`,
      stringifyObjectValues(updates),
    );
  }

  // Update a specific guess status
  async updateGuessStatus(
    roundId: string,
    teamId: string,
    word: string,
    guessed: boolean,
  ): Promise<void> {
    const client = await redisClient;
    const roundKey = `${this.redisPrefix}${roundId}:team:${teamId}`;

    // Retrieve the round data
    const roundData = await client.hGetAll(roundKey);
    if (!roundData) {
      throw new Error(`Round ${roundId} for team ${teamId} not found.`);
    }

    const roundInfo = parseObjectValues(roundData) as RoundInfo;

    // Update the specific guess
    const updatedGuesses = roundInfo.guesses.map((guess) =>
      guess.word === word ? { ...guess, guessed } : guess,
    );

    // Save the updated round info
    await client.hSet(
      roundKey,
      stringifyObjectValues({ guesses: updatedGuesses }),
    );
  }

  // Delete a specific round
  async deleteRound(roundId: string, teamId: string): Promise<void> {
    const client = await redisClient;

    // Delete the round data
    await client.del(`${this.redisPrefix}${roundId}:team:${teamId}`);

    // Remove the round from the team's list
    await client.sRem(`${this.redisPrefix}team:${teamId}:rounds`, roundId);

    // Check if the round still exists for any other team
    const remainingTeams = await client.keys(
      `${this.redisPrefix}${roundId}:team:*`,
    );
    if (remainingTeams.length === 0) {
      await client.sRem(`${this.redisPrefix}index`, roundId);
    }
  }

  // Check if a specific round exists for a team
  async roundExists(roundId: string, teamId: string): Promise<boolean> {
    const client = await redisClient;
    const exists = await client.exists(
      `${this.redisPrefix}${roundId}:team:${teamId}`,
    );
    return exists > 0;
  }
}

// Helper functions to serialize/deserialize objects
function stringifyObjectValues<T extends object>(
  obj: T,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, JSON.stringify(value)]),
  );
}

function parseObjectValues(obj: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, JSON.parse(value)]),
  );
}

export const roundRepository = new RoundRepository();
