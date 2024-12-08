export type GameSettings = {
  winningScore: number;
  roundTime: number;
  roomId: string;
};

export type JoinTeamRequest = {
  roomId: string;
  teamId: string;
};
