import { Controller, UseGuards, Body, Post } from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { CreateLobbyDto } from "./dto/create-lobby.dto";

@UseGuards(JwtGuard)
@Controller("lobbies")
export class LobbiesController {
  @Post()
  create(@Body() createLobbyDto: CreateLobbyDto) {
    return "This action adds a new lobby";
  }
}
