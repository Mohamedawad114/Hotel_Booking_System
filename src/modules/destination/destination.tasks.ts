import { Injectable } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HotelbedsProvider } from 'src/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class DestinationTasks {
  private readonly countrycode: string = process.env.COUNTRYCODE as string;
  constructor(
    private readonly destinationService: DestinationService,
    private readonly providerService: HotelbedsProvider,
    private readonly logger: PinoLogger,
  ) {}
  @Cron(CronExpression.EVERY_WEEKEND)
  async updateDestinations() {
    try {
      const destinations = await this.providerService.getDestinations(
        this.countrycode,
      );
      if (!destinations?.length) {
        this.logger.warn(
          'No destinations returned from provider, skipping update',
        );
        return;
      }
      await this.destinationService.updateDestinations(destinations);
      this.logger.info('task executed successfully');
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to update destinations');
    }
  }
}
