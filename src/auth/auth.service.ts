import { Injectable } from "@nestjs/common";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { AddUserDto } from "./dto/add-user.dto";
import { RedisKeys } from "src/common/enums";
import { JwtService } from "@nestjs/jwt/dist";
import { InternalServerErrorException } from "@nestjs/common/exceptions";
import { AuthToken, Whitelist } from "./types";

@Injectable()
export class AuthService {
  constructor(@InjectRedis() private readonly redis: Redis, private readonly jwt: JwtService) {}

  /**
   * Adds user to the whitelist
   * @param addUserDto
   * @returns AuthToken
   * @throws InternalServerErrorException
   */
  async addUser(addUserDto: AddUserDto) {
    const { nickname } = addUserDto;
    const jwtToken = this.jwt.sign({ nickname });
    const whitelistJSON = await this.redis.get(RedisKeys.Whitelist);

    try {
      // add the token to the whitelist
      const whitelist: Whitelist = JSON.parse(whitelistJSON);
      whitelist.push(jwtToken);
      await this.redis.set(RedisKeys.Whitelist, JSON.stringify(whitelist));

      return { token: jwtToken } as AuthToken;
    } catch (error) {
      throw new InternalServerErrorException("Could not add user to the whitelist");
    }
  }
}
