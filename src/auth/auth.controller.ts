import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AddUserDto } from "./dto/add-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("add-user")
  async addUser(@Body() addUserDto: AddUserDto) {
    return await this.authService.addUser(addUserDto);
  }
}
