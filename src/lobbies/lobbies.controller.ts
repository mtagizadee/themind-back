import { Controller, UseGuards, Body, Post } from "@nestjs/common";
import { User } from "src/auth/decorators/user.decorator";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { CreateLobbyDto } from "./dto/create-lobby.dto";
import { LobbiesService } from "./lobbies.service";

@UseGuards(JwtGuard)
@Controller("lobbies")
export class LobbiesController {
  constructor(private readonly lobbiesService: LobbiesService) {}

  @Post()
  create(@Body() createLobbyDto: CreateLobbyDto, @User("id") userId: string) {
    return this.lobbiesService.create(createLobbyDto, userId);
  }
}
