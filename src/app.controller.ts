import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  getHello() {
    return this.appService.getHello();
  }
}
