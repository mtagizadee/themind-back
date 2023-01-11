import { UsePipes, ValidationPipe } from "@nestjs/common";
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

  @UsePipes(new ValidationPipe())
  @SubscribeMessage("join")
  handleJoin(@MessageBody() data: JoinLobbyDto, @ConnectedSocket() client: Socket) {
    console.log(`User with nickname ${data.nickname} and id ${data.id} joined the lobby`);
  }
}
