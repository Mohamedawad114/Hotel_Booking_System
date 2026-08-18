import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const IdempotencyKey = createParamDecorator(
  (headerName: string = 'idempotency-key', ctx: ExecutionContext): string => {
    const key = headerName.toLowerCase();
    if (ctx.getType<string>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      return gqlCtx.getContext().req.headers?.[key];
    } else {
      return ctx.switchToHttp().getRequest().headers?.[key];
    }
  },
);
