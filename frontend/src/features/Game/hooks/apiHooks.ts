import { useUpdateGuessMutation } from "../services";
import { Guess } from "../../../context/GameContext";
import { useCallback } from "react";

export function useUpdateGuess(roomId: string, gameId: string) {
  const [makeGuess] = useUpdateGuessMutation();

  return useCallback(
    async (guess: Partial<Guess>) => {
      const req = {
        roomId,
        gameId,
        guess,
      };

      try {
        await makeGuess(req);
      } catch (error) {
        console.error("Failed to update guess:", { guess }, error);
      }
    },
    [roomId, gameId],
  );
}
