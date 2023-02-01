import { InjectRedis } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common/enums";
import { WsException } from "@nestjs/websockets/errors";
import Redis from "ioredis";
import { ERedisKeys } from "src/common/enums";
import { calculateNumberOfLevels, generateExpirationDate } from "src/helpers";
import { CreateGameDto } from "./dto/create-game.dto";
import { TGame } from "./types/game.type";

@Injectable()
export class GamesService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async create(createGameDto: CreateGameDto) {
    const games = await this.deleteExpiredGame();
    const { id, players } = createGameDto;

    const newGame: TGame = {
      players,
      board: [],
      currentLevel: 1,
      lastLevel: calculateNumberOfLevels(players),
      lives: players.length,
      hasShootingStar: false,
      expiresAt: generateExpirationDate(1),
    };

    games[id] = newGame;
    await this.redis.set(ERedisKeys.Games, JSON.stringify(games));

    return { id };
  }

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
