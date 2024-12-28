import { wordsRepository } from "./wordsRepository";
import { WordPack } from "./types";
import { shuffleArray } from "../utils";

class WordsService {
  async initWords(gameId: string) {
    const words = await wordsRepository.getAllWords(WordPack.SIMPLE_UKRAINIAN);
    const shuffledWords = shuffleArray(words);
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
}

export const wordsService = new WordsService();
