import { IsNotEmpty, IsNumberString, IsString } from "class-validator";
import { TCard } from "../types/card.type";

export class PlayCardDto {
  @IsNotEmpty()
  @IsString()
  gameId: string;

  @IsNotEmpty()
  @IsNumberString()
  card: TCard;
}
