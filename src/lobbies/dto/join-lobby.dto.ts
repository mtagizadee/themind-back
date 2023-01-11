import { IsUUID, IsString, IsNotEmpty } from "class-validator";

export class JoinLobbyDto {
  @IsNotEmpty()
  @IsUUID(4)
  id: string;

  @IsNotEmpty()
  @IsString()
  nickname: string;
}
