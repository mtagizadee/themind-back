import { Card, TCard } from "src/games/types/card.type";
import { TPlayer } from "src/games/types/player.type";

/**
 * Generates random distinct cards for each player in the level
 * @param level - level of the game
 * @param players - players in the game
 * @returns void
 */
export const generatePlayersCards = (level: number, players: TPlayer[]) => {
  const usedValues: TCard[] = [];

  // Generate cards for each player
  players.forEach((player) => {
    player.cards = generateRandomCards(level, usedValues);
  });
};

/**
 * Generates random distinct cards from 1 - 100 for the level
 * @param amount - amount of cards to generate
 * @param usedValues - values that are already generated in the level
 * @returns an array of cards
 */
export const generateRandomCards = (amount: number, usedValues: TCard[]) => {
  const cards: TCard[] = [];

  while (cards.length < amount) {
    const card = generateRandomCard();
    if (usedValues.includes(card)) continue;

    cards.push(card);
    usedValues.push(card);
  }

  return cards;
};

/**
 * Generates a random card from 1 - 100
 * @returns a random card
 */
const generateRandomCard = (): TCard => {
  return Card(Math.floor(Math.random() * 100) + 1);
};
