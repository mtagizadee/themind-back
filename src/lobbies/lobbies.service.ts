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
import { TLobby } from "./types/lobby.type";
import { generateExpirationDate } from "src/helpers";
import { TJwtPayload } from "src/auth/strategy/jwt.strategy";

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

      const newLobby: TLobby = {
        playersNumber,
        wsToken,
        players: [],
        authorId: userId,
        expiresAt: generateExpirationDate(1),
      };

      lobbies[id] = newLobby;

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
  async join(id: string, user: TJwtPayload) {
    try {
      const lobby: TLobby = await this.findOne(id);

      // check if the user already joined the lobby
      if (lobby.players.some((player) => player.id === user.id)) {
        throw new ForbiddenException("You already joined the lobby!");
      }

      // add user to the lobby and update the lobbies
      lobby.players.push(user);
      await this.update(id, lobby);

      return { wsToken: lobby.wsToken };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Removes a user from the lobby
   * @param id - the id of the lobby
   * @param userId - the id of the user that wants to leave the lobby
   * @returns the message that the user left the lobby successfully
   */
  async leave(id: string, userId: string) {
    try {
      const lobby: TLobby = await this.findOne(id);

      // check if the user is in the lobby
      if (!lobby.players.some((player) => player.id === userId)) {
        throw new ForbiddenException("You are not in the lobby!");
      }

      // remove the user from the lobby and update the lobbies
      lobby.players = lobby.players.filter((player) => player.id !== userId);
      await this.update(id, lobby);

      return { message: "User left the lobby successfully!" };
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

  /**
   * Updates a lobby
   * @param id - the id of the lobby
   * @param target - the target user
   * @returns the message that the lobby was updated successfully
   */
  private async update(id: string, lobby: TLobby) {
    try {
      const lobbies = await this.deleteExpiredLobbies();
      const target = lobbies[id];
      if (!target) throw new NotFoundException("Lobby is not found!");

      lobbies[id] = lobby;
      await this.redis.set("lobbies", JSON.stringify(lobbies));

      return { message: "Lobby updated successfully!" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a lobby
   * @param id - the id of the lobby that will be deleted
   * @returns the message that the lobby was deleted successfully
   */
  private async delete(id: string) {
    try {
      const lobbies = await this.deleteExpiredLobbies();
      const target = lobbies[id];
      if (!target) throw new NotFoundException("Lobby is not found!");

      delete lobbies[id];
      await this.redis.set("lobbies", JSON.stringify(lobbies));

      return { message: "Lobby deleted successfully!" };
    } catch (error) {
      throw error;
    }
  }
}
