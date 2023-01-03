import { IsString, Length } from "class-validator";

export class AddUserDto {
  @IsString()
  @Length(2, 24)
  nickname: string;
}
