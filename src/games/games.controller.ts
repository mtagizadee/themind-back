import { Controller, Get, Param } from "@nestjs/common";
import { GamesService } from "./games.service";

@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gamesService.findOne(id);
  }
}
