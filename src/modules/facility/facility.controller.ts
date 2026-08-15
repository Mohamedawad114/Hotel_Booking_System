import { Controller, Get, HttpCode } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import { FacilityService } from './facility.service';

@ApiTags('facilities')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilityService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all facilities' })
  @ApiResponse({
    status: 200,
    description: 'Facilities fetched successfully',
  })
  async getDestinations() {
    return this.facilitiesService.getAllFacilities();
  }
}
