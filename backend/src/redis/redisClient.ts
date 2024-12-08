import { createClient } from "redis";
import {logErrorMessage, logMessage} from "../utils";

const HOST = process.env.REDIS_HOST || "localhost";
const PORT = process.env.REDIS_PORT || "6379";

export const createRedisClient = async (
  host = "127.0.0.1",
  port = "6379",
): Promise<ReturnType<typeof createClient>> => {
  const client = createClient({
    url: `redis://${host}:${port}`,
  });

  await client.connect();

  client.on("connect", () => {
    logMessage(`Connected to Redis at ${host}:${port}`);
  });

  client.on("error", (err) => {
    logErrorMessage("Redis error:", err);
  });

  return client;
};

export const redisClient = createRedisClient(HOST, PORT);
