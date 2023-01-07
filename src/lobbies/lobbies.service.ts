import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { CreateLobbyDto } from "./dto/create-lobby.dto";
import { v4 } from "uuid";
import { lobbyResponseFactory, TLobby } from "./types/lobby.type";
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
    const wsToken = v4();

    try {
      // Get the lobbies from the redis and add the new one
      const lobbies = JSON.parse(await this.redis.get("lobbies"));
      lobbies[id] = {
        playersNumber,
        wsToken,
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

      return lobbyResponseFactory(lobby);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates an invitation link for a lobby
   * @param id - the id of the lobby
   * @param userId - the id of the user
   * @returns the invitation link
   */
  async generateInvitationLink(id: string, userId: string) {
    try {
      const lobby = await this.findOne(id);

      // check if the user is the author of the lobby
      if (lobby.authorId !== userId) {
        throw new ConflictException("You are not the author of the lobby!");
      }

      // generate the invitation link
      const link = process.env.FRONT_URL + "/invite/" + id;
      return { link };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Adds a user to the lobby
   * @param id - the id of the lobby
   * @param userId - the id of the user that wants to join the lobby
   * @returns the wsToken of the lobby
   */
  async join(id: string, userId: string) {
    try {
      const lobby = await this.findOne(id);

      // check if the user already joined the lobby
      if (lobby.players.includes(userId)) {
        throw new ForbiddenException("You already joined the lobby!");
      }

      // add user to the lobby and update the lobbies
      lobby.players.push(userId);
      const lobbies = JSON.parse(await this.redis.get("lobbies"));
      lobbies[id] = lobby;

      await this.redis.set("lobbies", JSON.stringify(lobbies));
      return { wsToken: lobby.wsToken };
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
