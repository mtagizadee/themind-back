import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { CreateLobbyDto } from "./dto/create-lobby.dto";
import { v4 } from "uuid";
import { TLobby } from "./types/lobby.type";
import { generateExpirationDate } from "src/helpers";

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
        expiresAt: generateExpirationDate(1),
      } as TLobby;
      await this.redis.set("lobbies", JSON.stringify(lobbies));

      return { id };
    } catch (error) {
      throw new ConflictException("Could not create a new lobby");
    }
  }

  /**
   * Finds a lobby by its id
   * @param id - the id of the lobby
   * @returns the lobby
   */
  async findOne(id: string) {
    try {
      const lobbies = await this.deleteExpiredLobbies();
      const lobby: TLobby = lobbies[id];
      if (!lobby) throw new NotFoundException("Lobby is not found!");

      return lobby;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes the expired lobbies (1 day)
   * @returns the lobbies after deleting the expired ones
   */
  private async deleteExpiredLobbies() {
    try {
      const lobbies = JSON.parse(await this.redis.get("lobbies"));

      // iterate over and delete those that have expired
      const currentDate = new Date();
      Object.keys(lobbies).forEach((lobbyId: string) => {
        if (lobbies[lobbyId].expiresAt < currentDate) {
          delete lobbies[lobbyId];
        }
      });

      await this.redis.set("lobbies", JSON.stringify(lobbies));
      return lobbies;
    } catch (error) {
      throw new ConflictException("Could not delete expired lobbies");
    }
  }
}
