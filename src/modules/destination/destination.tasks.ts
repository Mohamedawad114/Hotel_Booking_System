import { Injectable } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HotelbedsProvider } from 'src/common';

@Injectable()
export class DestinationTasks {
  private readonly countrycode: string = process.env.CPUNTRYCODE as string;
  constructor(
    private readonly destinationService: DestinationService,
    private readonly providerService: HotelbedsProvider,
  ) {}
  @Cron(CronExpression.EVERY_WEEKEND)
  async updateDestinations() {
    const destinations = await this.providerService.getDestinations(
      this.countrycode,
    );
    await this.destinationService.deleteDestinations();
    await this.destinationService.addDestination(destinations);
  }
}
