import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const gqlCtx = GqlExecutionContext.create(context);
    const isGraphQL = gqlCtx.getType() === 'graphql';
    if (isGraphQL) {
      return next.handle();
    }
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        return {
          message: data?.message || 'success',
          statusCode: res.statusCode,
          data: data?.data || null,
          meta: data?.meta || null,
        };
      }),
    );
  }
}
