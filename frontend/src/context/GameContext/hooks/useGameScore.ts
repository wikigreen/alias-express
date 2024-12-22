import { useCallback, useEffect, useState } from "react";

export function useGameScore(
  gameId?: string,
  teamIds?: string[],
): {
  score: Record<string, number>;
  setScore: (score?: Record<string, number>) => void;
} {
  const [score, setScoreState] = useState({} as Record<string, number>);

  const setScore = useCallback(
    (newScore?: Record<string, number>) =>
      setScoreState((oldScore: Record<string, number>) => ({
        ...oldScore,
        ...newScore,
      })),
    [],
  );

  useEffect(() => {
    if (gameId) {
      fetch(`/api/game/info/score/${gameId}`, {
        method: "POST",
        body: JSON.stringify({ teamIds }),
      })
        .then((res) => res.json())
        .then((json) => json as Record<string, number>)
        .then((newScore) =>
          setScoreState((oldScore: Record<string, number>) => ({
            ...oldScore,
            ...newScore,
          })),
        )
        .catch((error) =>
          console.error("Error during fetching score", error.stack),
        );
    }
  }, [gameId, teamIds?.join()]);

  return { score, setScore };
}
