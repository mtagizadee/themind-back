import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { GamesModule } from "src/games/games.module";
import { LobbiesController } from "./lobbies.controller";
import { LobbiesGateway } from "./lobbies.gateway";
import { LobbiesService } from "./lobbies.service";

@Module({
  controllers: [LobbiesController],
  providers: [LobbiesService, LobbiesGateway],
  imports: [JwtModule.register({}), GamesModule],
})
export class LobbiesModule {}
