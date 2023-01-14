import { IsUUID, IsNotEmpty } from "class-validator";

export class JoinLobbyDto {
  @IsNotEmpty()
  @IsUUID(4)
  lobbyId: string;
}
