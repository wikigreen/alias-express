import { v4 as uuid } from "uuid";

class WordsService {
  wordMap = {} as Record<string, string>;

  initWords(gameId: string) {
    this.wordMap[gameId] = uuid();
  }

  getCurrentWord(gameId: string) {
    return this.wordMap[gameId];
  }

  getCurrentAndNextWords(gameId: string) {
    const currentWord = this.wordMap[gameId];
    this.wordMap[gameId] = uuid();
    const nextWord = this.wordMap[gameId];
    return [currentWord, nextWord];
  }
}

export const wordsService = new WordsService();
