import { useCallback } from "react";
import { useKickPlayerMutation } from "../services";

export function useKickPlayerApi(roomId: string) {
  const [kickPlayer] = useKickPlayerMutation();

  return useCallback(
    async (playerNickname: string) => {
      const req = {
        roomId,
        playerNickname,
      };

      try {
        await kickPlayer(req);
      } catch (error) {
        console.error("Failed to kick player:", { req }, error);
      }
    },
    [roomId],
  );
}
