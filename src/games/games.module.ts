import { Module } from "@nestjs/common";
import { GamesService } from "./games.service";
import { GamesGateway } from "./games.gateway";
import { GamesController } from './games.controller';

@Module({
  providers: [GamesService, GamesGateway],
  exports: [GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
