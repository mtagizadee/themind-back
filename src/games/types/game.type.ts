import { TCard } from "./card.type";
import { TPlayer } from "./player.type";

// NOTE: This type is not finished yet
export type TGame = {
  /**
   * Players in the game inherited from the lobby
   * @type TPlayer[]
   * @important Players cannot be added or removed from the game after it starts
   */
  players: TPlayer[];

  board: TCard[];
  currentLevel: number;
  lastLevel: number;
  lives: number;
  hasShootingStar: boolean;
  expiresAt: Date;
};
