import { Controller, Get, HttpCode } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@Controller('destinations')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get()
  @HttpCode(200)
  async getDestinations() {
    return this.destinationService.getAllDestinations();
  }
}
