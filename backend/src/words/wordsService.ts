import { wordsRepository } from "./wordsRepository";
import { WordPack } from "./types";

class WordsService {
  async initWords(gameId: string) {
    const words = await wordsRepository.getAllWords(WordPack.SIMPLE_UKRAINIAN);
    const shuffledWords = this.shuffleArray(words);
    await wordsRepository.saveWordsForGame(gameId, shuffledWords);
  }

  async getCurrentWord(gameId: string) {
    return await wordsRepository.getFirstWord(gameId);
  }

  async getCurrentAndNextWords(gameId: string) {
    const currentWord = await wordsRepository.getFirstWord(gameId);
    const nextWord = await wordsRepository.moveLastWordToStartAndGet(gameId);
    return [currentWord, nextWord];
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Generate a random index
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }
}

export const wordsService = new WordsService();
