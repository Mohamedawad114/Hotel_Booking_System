import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class GlobalErrFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}
  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType();
    if (type === 'http') {
      this.handleHttp(exception, host);
    } else if (type === 'ws') {
      this.handleWs(exception, host);
    }
  }
  private handleHttp(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      return response.status(status).json({
        success: false,
        message: (res as any)?.message || exception.message,
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }
    this.logger.error(exception?.message, exception?.stack);

    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && {
        context: exception?.message,
        stack: exception?.stack,
      }),
    });
  }
  private handleWs(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();
    const data = ctx.getData();

    if (exception instanceof WsException) {
      const error = exception.getError();
      return client.emit('error', {
        success: false,
        message: (error as any)?.message || error,
        timestamp: new Date().toISOString(),
        data,
      });
    }
    this.logger.error(exception?.message, exception?.stack);
    return client.emit('error', {
      success: false,
      message:
        process.env.NODE_ENV !== 'production'
          ? exception?.message
          : 'Internal server error',
      timestamp: new Date().toISOString(),
      data,
    });
  }
}
