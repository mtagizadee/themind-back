import { InjectRedis } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { ERedisKeys } from "src/common/enums";
import { CreateGameDto } from "./dto/create-game.dto";

@Injectable()
export class GamesService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async create(createGameDto: CreateGameDto) {
    const games = JSON.parse(await this.redis.get(ERedisKeys.Games));
    const id = createGameDto.id;

    games[id] = { players: createGameDto.players };
    await this.redis.set(ERedisKeys.Games, JSON.stringify(games));

    return { id };
  }
}
