import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { UseGuards } from "@nestjs/common";
import { config } from "dotenv";
import { Client } from "src/auth/decorators/client.decorator";
import { EGameEvents } from "src/common/enums";
import { PlayCardDto } from "./dto/play-card.dto";
import { WsAuthGuard } from "src/auth/guards/ws-auth.guard";
import { TJwtPayload } from "src/auth/strategy/jwt.strategy";
import { Server, Socket } from "socket.io";
import { GamesService } from "./games.service";
import { generateRoom } from "src/helpers";
@UseGuards(WsAuthGuard)
@WebSocketGateway(
  parseInt(
    config({
      path: `.env.${process.env.NODE_ENV}`,
    }).parsed.WS_PORT
  ),
  {
    cors: {
      origin: "*",
    },
  }
)
export class GamesGateway {
  constructor(private readonly gamesService: GamesService) {}

  @SubscribeMessage(EGameEvents.Play)
  async handlePlay(
    @MessageBody() playCardDto: PlayCardDto,
    @Client() client: TJwtPayload,
    @ConnectedSocket() socket: Socket
  ) {
    const { gameId } = playCardDto;
    const response = await this.gamesService.playCard(playCardDto, client);
    const room = generateRoom(gameId);

    socket.to(room).emit(EGameEvents.Played, response);
    return { board: response.board, cards: response.playedCard.player };
  }
}
