import { TPlayer } from "src/games/types/player.type";

export * from "./game";

/**
 * Generates an expiration date
 * @param days - number of days to add to the current date
 * @returns a date that is the current date + the number of days passed which is used for the expiration date
 */
export const generateExpirationDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Generates a room name from the lobby id
 * @param lobbyId - id of the lobby
 * @returns the name of the room
 */
export const generateRoom = (lobbyId: string) => {
  return `lobby-${lobbyId}`;
};

export const calculateNumberOfLevels = (players: TPlayer[]) => {
  return players.length * 4 - 4;
};
