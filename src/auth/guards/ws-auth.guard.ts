import { Injectable, CanActivate, ExecutionContext, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TJwtPayload } from "../strategy/jwt.strategy";
import { WsException } from "@nestjs/websockets";

export type TVerifiedUser = TJwtPayload & { iat: number; exp: number };

const clientFactory = (payload: TVerifiedUser) => {
  delete payload.iat;
  delete payload.exp;
  return payload;
};

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const jwtToken = client.handshake.auth.jwtToken;

    try {
      const user = this.jwt.verify(jwtToken, { secret: process.env.JWT_SECRET }) as TVerifiedUser;
      client.user = clientFactory(user);

      return !!user;
    } catch (error) {
      throw new WsException({
        status: HttpStatus.UNAUTHORIZED,
        message: "Unauthorized",
      });
    }
  }
}
