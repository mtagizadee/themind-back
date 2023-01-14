import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { LobbiesController } from "./lobbies.controller";
import { LobbiesGateway } from "./lobbies.gateway";
import { LobbiesService } from "./lobbies.service";

@Module({
  controllers: [LobbiesController],
  providers: [LobbiesService, LobbiesGateway],
  imports: [JwtModule.register({})],
})
export class LobbiesModule {}
