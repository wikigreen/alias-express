import { v4 as uuid } from "uuid";

class WordsService {
  wordMap = {} as Record<string, string>;

  getCurrentWord(gameId: string) {
    if (this.wordMap[gameId] == null) {
      this.wordMap[gameId] = uuid();
    }
    return this.wordMap[gameId];
  }

  getCurrentAndNextWords(gameId: string) {
    if (this.wordMap[gameId] == null) {
      this.wordMap[gameId] = uuid();
    }
    const currentWord = this.wordMap[gameId];
    this.wordMap[gameId] = uuid();
    const nextWord = this.wordMap[gameId];
    return [currentWord, nextWord];
  }
}

export const wordsService = new WordsService();
