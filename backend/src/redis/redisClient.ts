import { createClient } from "redis";

const HOST = process.env.REDIS_HOST || "localhost";
const PORT = process.env.REDIS_PORT || "6379";

export const createRedisClient = async (
  host = "127.0.0.1",
  port = "6379",
): Promise<ReturnType<typeof createClient>> => {
  console.log(`redis://${host}:${port}`);
  const client = createClient({
    url: `redis://${host}:${port}`,
  });

  await client.connect();

  client.on("connect", () => {
    console.log(`Connected to Redis at ${host}:${port}`);
  });

  client.on("error", (err) => {
    console.error("Redis error:", err);
  });

  return client;
};

export const redisClient = createRedisClient(HOST, PORT);
