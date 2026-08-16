import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
export const AuthUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const CtxType = ctx.getType<GqlContextType>();
  if (CtxType === 'http') {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
  const context = GqlExecutionContext.create(ctx);
  return context.getContext().req.user;
});
