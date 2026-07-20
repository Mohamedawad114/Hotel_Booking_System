import { Controller, Get, HttpCode } from '@nestjs/common';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import { FacilityService } from './facility.service';
@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilityService) {}

  @Get()
  @HttpCode(200)
  async getDestinations() {
    return this.facilitiesService.getAllFacilities();
  }
}
