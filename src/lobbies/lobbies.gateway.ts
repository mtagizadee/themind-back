import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from "@nestjs/websockets";
import { JoinLobbyDto } from "./dto/join-lobby.dto";
import { config } from "dotenv";
import { Server, Socket } from "socket.io";
import { LobbiesService } from "./lobbies.service";
import { LeaveLobbyDto } from "./dto/leave-lobby.dto";
import { WsAuthGuard } from "../auth/guards/ws-auth.guard";
import { UseGuards } from "@nestjs/common/decorators/core/use-guards.decorator";
import { Client } from "../auth/decorators/client.decorator";
import { TJwtPayload } from "../auth/strategy/jwt.strategy";

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
export class LobbiesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly lobbiesService: LobbiesService) {}

  @SubscribeMessage("lobby:join")
  async handleJoin(
    @MessageBody() joinLobbyDto: JoinLobbyDto,
    @ConnectedSocket() socket: Socket,
    @Client() client: TJwtPayload
  ) {
    console.log(client);
    const response = await this.lobbiesService.join(joinLobbyDto.lobbyId, {
      id: joinLobbyDto.userId,
      nickname: joinLobbyDto.nickname,
    });

    this.server.emit("lobby:join", joinLobbyDto);
    return response;
  }

  @SubscribeMessage("lobby:leave")
  async handleLeave(@MessageBody() leaveLobbyDto: LeaveLobbyDto) {
    const response = await this.lobbiesService.leave(leaveLobbyDto.lobbyId, leaveLobbyDto.userId);

    this.server.emit("lobby:leave", leaveLobbyDto.userId);
    console.log(response);
    return response;
  }
}
