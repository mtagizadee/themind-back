import { TPlayer } from "../types/player.type";

// NOTE: This dto is not finished yet
export class CreateGameDto {
  id: string;
  players: TPlayer[];
}
