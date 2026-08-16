import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { WsException } from '@nestjs/websockets';
import { GraphQLError } from 'graphql/error';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class GlobalErrFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}
  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType<GqlContextType>();
    if (type === 'http') {
      this.handleHttp(exception, host);
    } else if (type === 'ws') {
      this.handleWs(exception, host);
    } else if (type === 'graphql') {
      this.handleGraphQl(exception, host);
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
  private handleGraphQl(exception: any, host: ArgumentsHost) {
    const gqlContext = GqlExecutionContext.create(host as any);
    const info = gqlContext.getInfo();
    this.logger.error(
      {
        fieldName: info?.fieldName,
        message: exception?.message,
        stack: exception?.stack,
      },
      `GraphQL Error in [${info?.fieldName || 'Unknown Field'}]`,
    );
    const isProd = process.env.NODE_ENV === 'production';
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const status = exception.getStatus();
      const message =
        typeof response === 'object' && (response as any).message
          ? (response as any).message
          : exception.message;
      throw new GraphQLError(
        Array.isArray(message) ? message.join(', ') : message,
        {
          extensions: {
            code: exception.constructor.name.toUpperCase() || 'BAD_REQUEST',
            status,
            ...(!isProd && { stacktrace: exception?.stack }),
          },
        },
      );
    }
  }
}
