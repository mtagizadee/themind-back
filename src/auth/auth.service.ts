import { Injectable } from "@nestjs/common";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { AddUserDto } from "./dto/add-user.dto";
import { RedisKeys } from "src/common/enums";

@Injectable()
export class AuthService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async addUser(addUserDto: AddUserDto) {
    const { nickname } = addUserDto;
  }
}
