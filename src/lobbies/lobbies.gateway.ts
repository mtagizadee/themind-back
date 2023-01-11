import { UsePipes, ValidationPipe } from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Socket } from "dgram";
import { JoinLobbyDto } from "./dto/join-lobby.dto";
import { config } from "dotenv";

@WebSocketGateway(
  parseInt(
    config({
      path: `.env.${process.env.NODE_ENV}`,
    }).parsed.WS_PORT
  ),
  { namespace: "lobbies" }
)
export class LobbiesGateway {
  @UsePipes(new ValidationPipe())
  @SubscribeMessage("join")
  handleJoin(@MessageBody() data: JoinLobbyDto, @ConnectedSocket() client: Socket) {
    client.emit("joined", data, (data: JoinLobbyDto) => {
      console.log(data);
    });
    return { event: "joined", data };
  }
}
