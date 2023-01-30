/**
 * A card is a string that represents a card in a deck.
 * @example "2" - Card with value 2
 * @example "0" - Shooting star card
 */
export type TCard = string;

export const Card = (value: number): TCard => {
  return String(value);
};
