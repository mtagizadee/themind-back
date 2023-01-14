import { TJwtPayload } from "src/auth/strategy/jwt.strategy";

export type TLobby = {
  playersNumber: number;
  players: TJwtPayload[];
  authorId: string;
  expiresAt: Date;
};

export const lobbyResponseFactory = (lobby: TLobby) => {
  return lobby;
};
