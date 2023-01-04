import { Injectable } from "@nestjs/common";
import { AddUserDto } from "./dto/add-user.dto";
import { JwtService } from "@nestjs/jwt/dist";
import { v4 } from "uuid";
import { JwtPayload } from "./strategy/jwt.strategy";

type AuthToken = { token: string };

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  /**
   * Adds user to the whitelist
   * @param addUserDto
   * @returns AuthToken
   */
  async addUser(addUserDto: AddUserDto) {
    const { nickname } = addUserDto;
    const id = v4();

    // generate a token
    const jwtToken = this.jwt.sign({ nickname, id } as JwtPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "12h",
    });

    return { token: jwtToken } as AuthToken;
  }
}
