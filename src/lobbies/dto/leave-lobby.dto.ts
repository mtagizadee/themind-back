import { IsUUID, IsNotEmpty } from "class-validator";

export class LeaveLobbyDto {
  @IsNotEmpty()
  @IsUUID(4)
  lobbyId: string;
}
