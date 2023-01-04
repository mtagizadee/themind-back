import { IsNotEmpty, Max, Min, IsInt } from "class-validator";

export class CreateLobbyDto {
  @IsNotEmpty()
  @IsInt()
  @Min(2)
  @Max(4)
  playersNumber: number;
}
