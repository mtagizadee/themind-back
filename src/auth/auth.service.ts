import { Injectable } from "@nestjs/common";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { AddUserDto } from "./dto/add-user.dto";
import { RedisKeys } from "src/common/enums";
import { JwtService } from "@nestjs/jwt/dist";

@Injectable()
export class AuthService {
  constructor(@InjectRedis() private readonly redis: Redis, private readonly jwt: JwtService) {}

  /**
   * Adds user to the whitelist
   * @param addUserDto
   */
  async addUser(addUserDto: AddUserDto) {
    const { nickname } = addUserDto;
  }
}
