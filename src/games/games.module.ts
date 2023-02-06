import { Module } from "@nestjs/common";
import { GamesService } from "./games.service";
import { GamesGateway } from "./games.gateway";
import { GamesController } from "./games.controller";
import { JwtModule } from "@nestjs/jwt";

@Module({
  providers: [GamesService, GamesGateway],
  imports: [JwtModule.register({})],
  exports: [GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
