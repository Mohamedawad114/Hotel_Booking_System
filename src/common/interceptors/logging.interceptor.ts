import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { names } from '../metrics/metricsNames';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger,
    @InjectMetric(names.counter)private readonly httpRequestCounter: Counter<string>,
    @InjectMetric(names.histogram)private readonly httpRequestHistogram: Histogram<string>
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const {method, url} = context.switchToHttp().getRequest();
    if (url === '/metrics' ||url === '/health') {
      return next.handle();
    }
    this.logger.info('Before...');
    const now = Date.now();
    const endTimer = this.httpRequestHistogram.startTimer({ method: method, path: url });
    return next
      .handle()
      .pipe(tap({
        next: () => {
          const durationMs = Date.now() - now;
          const { statusCode } = context.switchToHttp().getResponse();
          this.httpRequestCounter.inc({ method: method, path: url, status: statusCode });
          endTimer({ status: statusCode });
          this.logger.info(
            { method, url, statusCode, durationMs },
            `HTTP Request - ${method} ${url} ${statusCode} +${durationMs}ms`,
          )
        },
        error: (err) => {
          const statusCode = (err.status || 500).toString();
          const durationMs = Date.now() - now;
          this.httpRequestCounter.inc({ method, path:url, status: statusCode });
          endTimer({ status: statusCode });
          this.logger.error(
            { method, url, statusCode, durationMs, err: err.message },
            `HTTP Request Failed - ${method} ${url} ${statusCode} +${durationMs}ms`,
          );
        }
      }));
  }
}
