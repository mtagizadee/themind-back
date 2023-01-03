import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtConstants } from "src/common/enums";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      secret: JwtConstants.Secret,
      signOptions: { expiresIn: "12h" },
    }),
  ],
})
export class AuthModule {}
