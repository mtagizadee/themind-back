import { TJwtPayload } from "src/auth/strategy/jwt.strategy";
import { TCard } from "./card.type";

export type TPlayer = {
  cards: TCard[];
} & TJwtPayload;
