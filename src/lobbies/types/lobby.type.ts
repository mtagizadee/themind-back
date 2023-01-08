import { TJwtPayload } from "src/auth/strategy/jwt.strategy";

export type TLobby = {
  playersNumber: number;
  players: TJwtPayload[];
  authorId: string;
  expiresAt: Date;
  wsToken: string;
};

export const lobbyResponseFactory = (lobby: TLobby) => {
  delete lobby.wsToken;
  return lobby;
};
