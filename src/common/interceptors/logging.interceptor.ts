import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.info('Before...');
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => this.logger.info(`After... ${Date.now() - now}ms`)));
  }
}
