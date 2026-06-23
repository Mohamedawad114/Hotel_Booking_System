import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
export const AuthUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx);
    return context.getContext().req.user;
  },
);
