import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
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
import { ELobbyEvents } from "src/common/enums";

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

  @SubscribeMessage(ELobbyEvents.JOIN)
  async handleJoin(
    @MessageBody() joinLobbyDto: JoinLobbyDto,
    @Client() client: TJwtPayload,
    @ConnectedSocket() socket: Socket
  ) {
    const { lobbyId } = joinLobbyDto;
    const response = await this.lobbiesService.join(lobbyId, client);

    if (!response.userInLobby) {
      socket.join(lobbyId);
      this.server.to(lobbyId).emit(ELobbyEvents.JOIN, client);
    }

    return response.lobby;
  }

  @SubscribeMessage(ELobbyEvents.LEAVE)
  async handleLeave(
    @MessageBody() leaveLobbyDto: LeaveLobbyDto,
    @Client("id") userId: string,
    @ConnectedSocket() socket: Socket
  ) {
    const { lobbyId } = leaveLobbyDto;
    const response = await this.lobbiesService.leave(lobbyId, userId);

    this.server.to(lobbyId).emit(ELobbyEvents.LEAVE, userId);
    socket.leave(lobbyId);
    return response;
  }
}
