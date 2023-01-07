export type TLobby = {
  playersNumber: number;
  players: string[]; // TODO: change to an array of player objects
  authorId: string;
  expiresAt: Date;
};
