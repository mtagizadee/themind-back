import { InjectRedis } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common/enums";
import { WsException } from "@nestjs/websockets/errors";
import Redis from "ioredis";
import { ERedisKeys } from "src/common/enums";
import { calculateNumberOfLevels, generateExpirationDate, generatePlayersCards } from "src/helpers";
import { CreateGameDto } from "./dto/create-game.dto";
import { TGame } from "./types/game.type";

@Injectable()
export class GamesService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Creates a new game
   * @param createGameDto - the data to create a new game
   * @returns the id of the newly created game
   */
  async create(createGameDto: CreateGameDto) {
    const games = await this.deleteExpiredGame();
    const { id, players } = createGameDto;

    // current level is always 1 when a new game is created
    const currentLevel = 1;
    generatePlayersCards(currentLevel, players);

    console.log(players);

    const newGame: TGame = {
      players,
      board: [],
      currentLevel,
      lastLevel: calculateNumberOfLevels(players),
      lives: players.length,
      hasShootingStar: false,
      expiresAt: generateExpirationDate(1),
    };

    games[id] = newGame;
    await this.redis.set(ERedisKeys.Games, JSON.stringify(games));

    return { id };
  }

  /**
   * Deletes the expired games
   * @returns the games that have not expired
   */
  private async deleteExpiredGame() {
    try {
      const games = JSON.parse(await this.redis.get(ERedisKeys.Games));

      // iterate over and delete those that have expired
      const currentDate = new Date();
      Object.keys(games).forEach((gameId: string) => {
        if (new Date(games[gameId].expiresAt) < currentDate) {
          delete games[gameId];
        }
      });

      await this.redis.set(ERedisKeys.Games, JSON.stringify(games));
      return games;
    } catch (error) {
      throw new WsException({
        status: HttpStatus.CONFLICT,
        message: "Could not delete expired lobbies",
      });
    }
  }

  /**
   * Updates a game by its id
   * @param id - the id of the game to update
   * @param game - the data to which the game will be updated
   * @returns the message that update was successful
   */
  private async update(id: string, game: TGame) {
    try {
      const games = await this.deleteExpiredGame();
      const target = games[id];
      if (!target)
        throw new WsException({
          status: HttpStatus.NOT_FOUND,
          message: "Game is not found!",
        });

      games[id] = game;
      await this.redis.set(ERedisKeys.Games, JSON.stringify(games));

      return { message: "Game updated successfully!" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a game by its id
   * @param id - the id of the game to delete
   * @returns the message that delete was successful
   */
  private async delete(id: string) {
    try {
      const games = await this.deleteExpiredGame();
      const target = games[id];
      if (!target)
        throw new WsException({
          status: HttpStatus.NOT_FOUND,
          message: "Game is not found!",
        });

      delete games[id];
      await this.redis.set(ERedisKeys.Games, JSON.stringify(games));

      return { message: "Game deleted successfully!" };
    } catch (error) {
      throw error;
    }
  }
}
