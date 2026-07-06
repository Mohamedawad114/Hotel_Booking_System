import { Controller, Get, HttpCode } from '@nestjs/common';
import { DestinationService } from './destination.service';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get()
  @HttpCode(200)
  async getDestinations() {
    return this.destinationService.getAllDestinations();
  }
}
