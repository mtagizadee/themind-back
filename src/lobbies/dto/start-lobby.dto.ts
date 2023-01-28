import { IsNotEmpty, IsUUID } from "class-validator";

export class StartLobbyDto {
  @IsNotEmpty()
  @IsUUID()
  lobbyId: string;
}
