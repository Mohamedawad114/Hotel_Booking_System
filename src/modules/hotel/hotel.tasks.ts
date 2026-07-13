import { Injectable } from '@nestjs/common';
import { HotelServices } from './hotel.service';
import { HotelbedsProvider } from 'src/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class HotelTask {
  private countryCode: string;
  constructor(
    private readonly hotelServices: HotelServices,
    private readonly hotelProvider: HotelbedsProvider,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.countryCode = this.configService.getOrThrow<string>('COUNTRYCODE');
  }

  @Cron('0 0 1 * * *')
  async updateHotels() {
    try {
      const hotels = await this.hotelProvider.getHotels(this.countryCode);
      await this.hotelServices.updateHotels(hotels);
    } catch (err) {
      this.logger.info("can't update hotels");
      throw err;
    }
  }
}
