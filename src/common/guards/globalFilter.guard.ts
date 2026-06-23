import { ArgumentsHost, ExceptionFilter, HttpException, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
@Injectable()

export class GlobalErrFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType();
    if (type === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const res = exception.getResponse();
        return response.status(status).json({
          success: false,
          message: (res as any).message || exception.message,
          statusCode: status || 500,
          path: request.url,
          timestamp: new Date().toISOString(),
        });
      }
      return response.status(500).json({
        success: false,
        message: 'something broking',
        context: exception.message,
        stack: exception.stack,
        path: request.url,
      });
    } else if (type === 'ws') {
      const ctx = host.switchToWs();
      const client = ctx.getClient();
      if (exception instanceof WsException) {
        const data = host.switchToWs().getData();
        if (exception instanceof WsException) {
          const error = exception.getError();
          client.emit('error', {
            success: false,
            message: (error as any).message || error,
            timestamp: new Date().toISOString(),
            data,
          });
        }
      }
    }
  }
}
