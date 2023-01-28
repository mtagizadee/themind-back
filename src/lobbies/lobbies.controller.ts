import { Controller, UseGuards, Body, Post, Get, Param } from "@nestjs/common";
import { User } from "src/auth/decorators/user.decorator";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { CreateLobbyDto } from "./dto/create-lobby.dto";
import { LobbiesService } from "./lobbies.service";
import { lobbyResponseFactory } from "./types/lobby.type";

@UseGuards(JwtGuard)
@Controller("lobbies")
export class LobbiesController {
  constructor(private readonly lobbiesService: LobbiesService) {}

  @Post()
  create(@Body() createLobbyDto: CreateLobbyDto, @User("id") userId: string) {
    return this.lobbiesService.create(createLobbyDto, userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return lobbyResponseFactory(await this.lobbiesService.findOne(id));
  }

  @Post(":id/invitation-link")
  generateInvitationLink(@Param("id") id: string, @User("id") userId: string) {
    return this.lobbiesService.generateInvitationLink(id, userId);
  }
}
