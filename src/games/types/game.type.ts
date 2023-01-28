import { TPlayer } from "./player.type";

// NOTE: This type is not finished yet
export type TGame = {
  /**
   * The game id inherited from the lobby id
   * @type string
   */
  id: string;

  /**
   * Players in the game inherited from the lobby
   * @type TPlayer[]
   * @important Players cannot be added or removed from the game after it starts
   */
  players: TPlayer[];
};
