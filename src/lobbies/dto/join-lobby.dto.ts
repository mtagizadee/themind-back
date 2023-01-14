import { IsUUID, IsString, IsNotEmpty } from "class-validator";

export class JoinLobbyDto {
  @IsNotEmpty()
  @IsUUID(4)
  lobbyId: string;

  @IsNotEmpty()
  @IsUUID(4)
  userId: string;

  @IsNotEmpty()
  @IsString()
  nickname: string;
}
