import { TJwtPayload } from "src/auth/strategy/jwt.strategy";
import { TCard } from "./card.type";

export type TPlayer = {
  cards: TCard[];
} & TJwtPayload;

/**
 * Creates a player object from the payload
 * @param player - player that will be transformed into a player object
 * @returns player object
 */
export const playerFactory = (player: TJwtPayload) => {
  return {
    ...player,
    cards: [],
  };
};
