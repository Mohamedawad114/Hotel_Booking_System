import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HotelbedsProvider } from 'src/common';
import { PinoLogger } from 'nestjs-pino';
import { FacilityService } from './facility.service';

@Injectable()
export class FacilityTasks {
  constructor(
    private readonly facilityService: FacilityService,
    private readonly providerService: HotelbedsProvider,
    private readonly logger: PinoLogger,
  ) {}
  @Cron('0 0 1 * *')
  async updateFacilities() {
    try {
      const facilities = await this.providerService.getFacilities();
      if (!facilities?.length) {
        this.logger.warn(
          'No facilities returned from provider, skipping update',
        );
        return;
      }
      await this.facilityService.updateFacilities(facilities);
      this.logger.info('task executed successfully');
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to update facilities');
    }
  }
}
