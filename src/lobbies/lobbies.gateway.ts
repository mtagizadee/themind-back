import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from "@nestjs/websockets";
import { JoinLobbyDto } from "./dto/join-lobby.dto";
import { config } from "dotenv";
import { Server } from "socket.io";
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

  /**
   * Handles the join event from the client to the lobby
   * @param joinLobbyDto
   * @param client - the user that is joining the lobby
   * @returns TLobby - the lobby that the user joined
   */
  @SubscribeMessage(ELobbyEvents.JOIN)
  async handleJoin(@MessageBody() joinLobbyDto: JoinLobbyDto, @Client() client: TJwtPayload) {
    const response = await this.lobbiesService.join(joinLobbyDto.lobbyId, client);

    if (!response.userInLobby) {
      this.server.emit(ELobbyEvents.JOIN, client);
    }

    return response.lobby;
  }

  /**
   * Handles the leave event from the client from the lobby
   * @param leaveLobbyDto
   * @param userId - the id of the user that is leaving the lobby
   * @returns message that the user left the lobby
   */
  @SubscribeMessage(ELobbyEvents.LEAVE)
  async handleLeave(@MessageBody() leaveLobbyDto: LeaveLobbyDto, @Client("id") userId: string) {
    const response = await this.lobbiesService.leave(leaveLobbyDto.lobbyId, userId);

    this.server.emit(ELobbyEvents.LEAVE, userId);
    return response;
  }
}
