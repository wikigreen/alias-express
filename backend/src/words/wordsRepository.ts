import fs from "fs";
import path from "path";
import { WordPack } from "./types";
import readline from "readline";
import { NotFoundError } from "../common/routesExceptionHandler";
import { redisClient } from "../redis";

class WordsRepository {
  readonly WORDS_PACK_TYPE_TO_FILE_MAPPING = {
    [WordPack.SIMPLE_UKRAINIAN]: "simpleUa.txt",
    [WordPack.SIMPLE_ENGLISH]: "simpleEng.txt",
  };

  async getAllWords(wordPack: WordPack): Promise<string[]> {
    if (wordPack == null) {
      throw new NotFoundError(`No word pack '${wordPack}'`);
    }
    const words: string[] = [];

    const filePath = `./data/${this.WORDS_PACK_TYPE_TO_FILE_MAPPING[wordPack]}`;

    const fullPath = path.resolve(__dirname, filePath);
    const fileStream = fs.createReadStream(fullPath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity, // Handles CRLF line endings properly
    });

    for await (const line of rl) {
      const trimmedWord = line.trim();
      if (trimmedWord) {
        words.push(trimmedWord);
      }
    }

    return words;
  }

  async saveWordsForGame(gameId: string, words: string[]) {
    const client = await redisClient;
    client.rPush(`words:gameId:${gameId}`, words);
    client.expire(`words:gameId:${gameId}`, 60 * 60 * 24);
  }

  async getFirstWord(gameId: string) {
    const client = await redisClient;
    const [word] = await client.lRange(`words:gameId:${gameId}`, 0, 0);
    return word;
  }

  async moveLastWordToStartAndGet(gameId: string) {
    const client = await redisClient;
    return await client.rPopLPush(
      `words:gameId:${gameId}`,
      `words:gameId:${gameId}`,
    );
  }
}

export const wordsRepository = new WordsRepository();
