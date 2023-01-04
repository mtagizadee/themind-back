import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { CreateLobbyDto } from "./dto/create-lobby.dto";
import { v4 } from "uuid";

@Injectable()
export class LobbiesService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Creates a new lobby
   * @param createLobbyDto
   * @returns the id of the newly created lobby
   * @throws ConflictException if the lobby could not be created
   */
  async create(createLobbyDto: CreateLobbyDto, userId: string) {
    const { playersNumber } = createLobbyDto;
    const id = v4();

    try {
      // Get the lobbies from the redis and add the new one
      const lobbies = JSON.parse(await this.redis.get("lobbies"));
      lobbies[id] = {
        playersNumber,
        players: [],
        authorId: userId,
      };
      await this.redis.set("lobbies", JSON.stringify(lobbies));

      return { id };
    } catch (error) {
      throw new ConflictException("Could not create a new lobby");
    }
  }
}
