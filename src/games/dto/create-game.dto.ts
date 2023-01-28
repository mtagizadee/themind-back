import { TPlayer } from "../types/player.type";

// NOTE: This dto is not finished yet
export class CreateLobbyDto {
  id: string;
  players: TPlayer[];
}
