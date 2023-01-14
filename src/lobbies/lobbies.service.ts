import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { CreateLobbyDto } from "./dto/create-lobby.dto";
import { v4 } from "uuid";
import { TLobby } from "./types/lobby.type";
import { generateExpirationDate } from "src/helpers";
import { TJwtPayload } from "src/auth/strategy/jwt.strategy";
import { WsException } from "@nestjs/websockets/errors";
import { HttpStatus } from "@nestjs/common/enums";
import { ERedisKeys } from "src/common/enums";

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
      const lobbies = JSON.parse(await this.redis.get(ERedisKeys.Lobbies));

      const newLobby: TLobby = {
        playersNumber,
        players: [],
        authorId: userId,
        expiresAt: generateExpirationDate(1),
      };

      lobbies[id] = newLobby;

      await this.redis.set(ERedisKeys.Lobbies, JSON.stringify(lobbies));
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
   * @returns the wsToken of the lobby and lobby itself
   */
  async join(id: string, user: TJwtPayload) {
    try {
      const lobby: TLobby = await this.findOne(id);

      // check if the user already joined the lobby
      const userInLobby = lobby.players.some((player) => player.id === user.id);

      // check if the lobby is full
      if (!userInLobby && lobby.players.length === lobby.playersNumber) {
        throw new WsException({
          status: HttpStatus.FORBIDDEN,
          message: "The lobby is full!",
        });
      }

      // add user to the lobby and update the lobbies
      if (!userInLobby) {
        lobby.players.push(user);
        await this.update(id, lobby);
      }

      return { lobby, userInLobby };
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
        throw new WsException({
          staus: HttpStatus.FORBIDDEN,
          message: "You are not in the lobby!",
        });
      }

      const isLastUser: boolean = lobby.players.length === 1;
      const isAuthor = lobby.authorId === userId;
      lobby.players = lobby.players.filter((player) => player.id !== userId);

      // if the user is the last one in the lobby, delete the lobby
      // else update the lobby and set the new author
      if (!isLastUser) {
        if (isAuthor) {
          lobby.authorId = lobby.players[0].id;
        }

        await this.update(id, lobby);
      } else await this.delete(id);

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
      const lobbies = JSON.parse(await this.redis.get(ERedisKeys.Lobbies));

      // iterate over and delete those that have expired
      const currentDate = new Date();
      Object.keys(lobbies).forEach((lobbyId: string) => {
        if (new Date(lobbies[lobbyId].expiresAt) < currentDate) {
          delete lobbies[lobbyId];
        }
      });

      await this.redis.set(ERedisKeys.Lobbies, JSON.stringify(lobbies));
      return lobbies;
    } catch (error) {
      console.log(error);
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
      await this.redis.set(ERedisKeys.Lobbies, JSON.stringify(lobbies));

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
      await this.redis.set(ERedisKeys.Lobbies, JSON.stringify(lobbies));

      return { message: "Lobby deleted successfully!" };
    } catch (error) {
      throw error;
    }
  }
}
