import { Controller, Get, HttpCode } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DestinationService } from './destination.service';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';

@ApiTags('destinations')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@Controller('destinations')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all destinations' })
  @ApiResponse({
    status: 200,
    description: 'Destinations fetched successfully',
  })
  async getDestinations() {
    return this.destinationService.getAllDestinations();
  }
}
