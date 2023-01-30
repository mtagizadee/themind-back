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
import { generateRoom } from "src/helpers";
import { StartLobbyDto } from "./dto/start-lobby.dto";

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

  @SubscribeMessage(ELobbyEvents.Join)
  async handleJoin(
    @MessageBody() joinLobbyDto: JoinLobbyDto,
    @Client() client: TJwtPayload,
    @ConnectedSocket() socket: Socket
  ) {
    const { lobbyId } = joinLobbyDto;
    const room = generateRoom(lobbyId);
    const response = await this.lobbiesService.join(lobbyId, client);

    if (!response.userInLobby) {
      await socket.join(room);
      socket.to(room).emit(ELobbyEvents.Join, client);
    }

    return response.lobby;
  }

  @SubscribeMessage(ELobbyEvents.Leave)
  async handleLeave(
    @MessageBody() leaveLobbyDto: LeaveLobbyDto,
    @Client("id") userId: string,
    @ConnectedSocket() socket: Socket
  ) {
    const { lobbyId } = leaveLobbyDto;
    const room = generateRoom(lobbyId);
    const response = await this.lobbiesService.leave(lobbyId, userId);

    socket.to(room).emit(ELobbyEvents.Leave, userId);
    await socket.leave(room);
    return response;
  }

  @SubscribeMessage(ELobbyEvents.Start)
  async handleStart(
    @MessageBody() startLobbyDto: StartLobbyDto,
    @Client("id") userId: string,
    @ConnectedSocket() socket: Socket
  ) {
    const { lobbyId } = startLobbyDto;
    const room = generateRoom(lobbyId);

    const response = await this.lobbiesService.start(lobbyId, userId);
    socket.to(room).emit(ELobbyEvents.Start, response);

    return response;
  }
}
