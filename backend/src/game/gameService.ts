import { AliasGameState, GameSettings, GameStatus, Team } from "./types";
import { v4 as uuid } from "uuid";
import { gameRepository } from "./gameRespository";
import { socketio } from "../index";
import { roomService } from "../room/roomService";
import { Optional } from "../utils";
import { roundRepository } from "../round";
import { Guess } from "../round/types";

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
    const currentRound = await roundRepository.getRoundNumber(gameId);

    return {
      ...game,
      currentTeam,
      currentPlayer: currentPlayer!,
      currentRound,
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

    await roundRepository.setRoundNumber(gameId, 1);
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
        () => this.#endGuessingTime(roomId, gameId),
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

    const { playerId: activePlayerId, teamId: activeTeamId } =
      await this.getActivePlayer(gameId);

    if (playerId !== activePlayerId) {
      return false;
    }

    if (gameStatus === "ongoing") {
      return true;
    }

    await gameRepository.saveGameMetadata(gameId, {
      gameStatus: "ongoing",
    });

    const nextPlayerToGuess = await this.nextPlayerToGuess(
      gameId,
      activeTeamId!,
    );
    await roundRepository.addPlayerToRoundFinishers(
      activeTeamId!,
      activePlayerId,
    );
    const nextPlayerInRoundFinishers =
      await roundRepository.isPlayerInRoundFinishers(
        activeTeamId!,
        nextPlayerToGuess!,
      );
    if (nextPlayerInRoundFinishers) {
      await roundRepository.addTeamToRoundFinishers(gameId, activeTeamId!);
      await roundRepository.clearRoundFinishersPlayers(activeTeamId!);
    }
    const nextTeamToGuess = await this.nextTeamToGuess(gameId);
    const roundFinished = await roundRepository.isTeamInRoundFinishers(
      gameId,
      nextTeamToGuess!,
    );
    if (roundFinished) {
      const winner = await this.getWinner(gameId);
      if (!winner) {
        await roundRepository.incrementAndGetRoundNumber(gameId);
        await roundRepository.clearRoundFinishersTeams(gameId);
      } else {
        await gameRepository.saveGameMetadata(gameId, {
          gameStatus: "completed",
          winnerTeamId: winner,
        });
      }
    }

    await this.#emitGameState(roomId, gameId);
    return true;
  }

  async registerGuess(
    roomId: string,
    gameId: string,
    playerId: string,
    guessed: boolean,
  ): Promise<boolean> {
    if (!roomId || !gameId) {
      return false;
    }
    const gameStatus = await this.getGameStatus(gameId);

    if (
      !gameStatus ||
      !new Set<GameStatus>(["lastWord", "ongoingRound"]).has(gameStatus)
    ) {
      return false;
    }

    const { playerId: activePlayerId, teamId: activeTeamId } =
      await this.getActivePlayer(gameId);

    if (playerId !== activePlayerId) {
      return false;
    }

    const currentRound = await roundRepository.getRoundNumber(gameId);

    await roundRepository.saveGuess(currentRound, activeTeamId!, gameId, {
      guessed,
      word: uuid(),
      createTime: new Date().getTime(),
    });

    await this.emitGuesses(gameId, activeTeamId!);
    await this.emitScore(gameId, activeTeamId!);

    if (gameStatus === "lastWord") {
      await gameRepository.saveGameMetadata(gameId, {
        gameStatus: "guessesCorrection",
      });
      await this.#emitGameState(roomId, gameId);
    }

    return true;
  }

  async #endGuessingTime(roomId: string, gameId: string): Promise<void> {
    await gameRepository.saveGameMetadata(gameId, {
      gameStatus: "lastWord",
    });
    await this.#emitGameState(roomId, gameId);
  }

  async getGameStatus(gameId: string): Promise<GameStatus | null> {
    return await gameRepository.getGameStatus(gameId);
  }

  async getScore(
    gameId: string,
    teamsIds: string[] = [],
  ): Promise<Record<string, number>> {
    let teamIds = ((await this.getTeams(gameId)) || []).map((team) => team?.id);

    if (teamsIds.length > 0) {
      const teamIdsSet = new Set<string>(teamsIds);
      teamIds = teamIds.filter((id) => {
        return teamIdsSet.has(id);
      });
    }

    const rounds = await roundRepository.getAllRoundIdsForGame(gameId);

    const guessesPerTeam = teamIds?.reduce(
      (prev, curr) => {
        return { ...prev, ...{ [curr]: [] } };
      },
      {} as Record<string, Guess[]>,
    );

    for (const teamId of teamIds) {
      for (const round of rounds) {
        guessesPerTeam[teamId].push(
          ...(await roundRepository.getGuessesOfRoundByTeam(
            gameId,
            round,
            teamId,
          )),
        );
      }
    }

    return Object.fromEntries(
      Object.entries(guessesPerTeam).map(([key, value]) => [
        key,
        value
          .map((guess) => (guess.guessed ? 1 : -1))
          .reduce((a, b) => a + b, 0),
      ]),
    );
  }

  async emitGuesses(
    gameId: string,
    teamId: string,
    playerId?: string,
  ): Promise<Guess[]> {
    const currentRound = await roundRepository.getRoundNumber(gameId);
    const guesses = await roundRepository.getGuessesOfRoundByTeam(
      gameId,
      currentRound,
      teamId,
    );

    socketio.to(playerId || gameId).emit("guesses", guesses);

    return guesses;
  }

  async emitScore(
    gameId: string,
    teamId: string,
    playerId?: string,
  ): Promise<Record<string, number>> {
    const score = await this.getScore(gameId, [teamId]);

    socketio.to(playerId || gameId).emit("score", score);

    return score;
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

  private async nextPlayerToGuess(gameId: string, teamId: string) {
    return gameRepository.moveLastPlayerToBeginningAndGet(gameId, teamId);
  }

  private async nextTeamToGuess(gameId: string) {
    return gameRepository.moveLastTeamToBeginningAndGet(gameId);
  }

  private async getWinner(gameId: string) {
    const allGuesses = await roundRepository.getAllRoundsGrouped(gameId);
    const flatGuesses: (Guess & { teamId: string })[] = Object.entries(
      allGuesses,
    ).flatMap(([, guessesPerTeam]) =>
      Object.entries(guessesPerTeam).flatMap(([teamId, guess]) =>
        guess.map((g) => ({ ...g, teamId })),
      ),
    );

    const result = flatGuesses.reduce(
      (acc, guess) => {
        acc[guess.teamId] = (acc[guess.teamId] || 0) + (guess.guessed ? 1 : -1);
        return acc;
      },
      {} as Record<string, number>,
    );

    const highestScore = Math.max(...Object.entries(result).map(([, v]) => v));

    const { winningScore } = (await gameRepository.getGameSettings(gameId)) || {
      winningScore: Infinity,
    };

    if (highestScore < winningScore) {
      return null;
    }

    const [winner, ...contenders] = Object.entries(result)
      .filter(([, value]) => value === winningScore)
      .map(([key]) => key);

    return contenders.length < 1 ? winner : null;
  }
}

export const gameService = new GameService();
