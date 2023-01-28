import { Module } from "@nestjs/common";
import { GamesService } from "./games.service";
import { GamesGateway } from "./games.gateway";

@Module({
  providers: [GamesService, GamesGateway],
  exports: [GamesService],
})
export class GamesModule {}