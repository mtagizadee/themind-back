import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TJwtPayload } from "../strategy/jwt.strategy";

export const Client = createParamDecorator((data: keyof TJwtPayload, ctx: ExecutionContext) => {
  const client = ctx.switchToWs().getClient();
  const user = client.user as TJwtPayload;

  return data ? user?.[data] : user;
});
