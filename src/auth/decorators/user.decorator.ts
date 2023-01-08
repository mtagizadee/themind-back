import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TJwtPayload } from "../strategy/jwt.strategy";

export const User = createParamDecorator((data: keyof TJwtPayload, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as TJwtPayload;

  return data ? user?.[data] : user;
});
