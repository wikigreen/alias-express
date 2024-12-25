import { v4 as uuid } from "uuid";

class WordsService {
  private wordMap = {} as Record<string, string>;

  async initWords(gameId: string) {
    this.wordMap[gameId] = uuid().substring(24);
  }

  async getCurrentWord(gameId: string) {
    return this.wordMap[gameId];
  }

  async getCurrentAndNextWords(gameId: string) {
    const currentWord = this.wordMap[gameId];
    this.wordMap[gameId] = uuid().substring(24);
    const nextWord = this.wordMap[gameId];
    return [currentWord, nextWord];
  }
}

export const wordsService = new WordsService();
