import { Controller, Get, Param } from "@nestjs/common";
import { UseGuards } from "@nestjs/common/decorators";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { GamesService } from "./games.service";

@UseGuards(JwtGuard)
@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gamesService.findOne(id);
  }
}
