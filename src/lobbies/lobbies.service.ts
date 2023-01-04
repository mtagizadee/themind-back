import { Injectable } from "@nestjs/common";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { CreateLobbyDto } from "./dto/create-lobby.dto";
import { v4 } from "uuid";

@Injectable()
export class LobbiesService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async create(createLobbyDto: CreateLobbyDto) {
    const id = v4();
  }
}
