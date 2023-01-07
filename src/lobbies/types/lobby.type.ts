export type TLobby = {
  playersNumber: number;
  players: string[]; // TODO: change to an array of player objects
  authorId: string;
  expiresAt: Date;
  wsToken: string;
};

export const lobbyResponseFactory = (lobby: TLobby) => {
  delete lobby.wsToken;
  return lobby;
};
