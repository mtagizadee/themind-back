import { Module } from "@nestjs/common";
import { LobbiesController } from "./lobbies.controller";
import { LobbiesGateway } from "./lobbies.gateway";
import { LobbiesService } from "./lobbies.service";

@Module({
  controllers: [LobbiesController],
  providers: [LobbiesService, LobbiesGateway],
})
export class LobbiesModule {}
