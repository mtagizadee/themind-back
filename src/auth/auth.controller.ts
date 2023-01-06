import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { User } from "./decorators/user.decorator";
import { AddUserDto } from "./dto/add-user.dto";
import { JwtGuard } from "./guards/jwt.guard";
import { JwtPayload } from "./strategy/jwt.strategy";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("add-user")
  async addUser(@Body() addUserDto: AddUserDto) {
    return await this.authService.addUser(addUserDto);
  }

  @UseGuards(JwtGuard)
  @Get("me")
  async me(@User() user: JwtPayload) {
    return user;
  }
}
