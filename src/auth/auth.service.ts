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
    // geenrate a token
    const jwtToken = this.jwt.sign(
      { nickname },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: "12h",
      }
    );

    try {
      // add the token to the whitelist
      const whitelistJSON = await this.redis.get(RedisKeys.Whitelist);
      const whitelist: Whitelist = JSON.parse(whitelistJSON);
      whitelist.push(jwtToken);
      await this.redis.set(RedisKeys.Whitelist, JSON.stringify(whitelist));

      return { token: jwtToken } as AuthToken;
    } catch (error) {
      throw new InternalServerErrorException("Could not add user to the whitelist");
    }
  }
}
