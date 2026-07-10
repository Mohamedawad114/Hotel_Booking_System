import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import {
  DestinationRepository,
  HotelbedsProvider,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { DestinationDto } from './Dto/destination.dto';

@Injectable()
export class DestinationService implements OnModuleInit {
  constructor(
    private readonly destinationRepo: DestinationRepository,
    private readonly logger: PinoLogger,
    private readonly providerService: HotelbedsProvider,
    private readonly config: ConfigService,
  ) {}
  getAllDestinations = async () => {
    const cahchedDestinations = await redis.get(redisKeys.destination());
    if (cahchedDestinations) {
      return {
        message: 'destinations fetched from cache',
        data: JSON.parse(cahchedDestinations),
      };
    }
    const destinations = await this.destinationRepo.findMany({}, {});
    await redis.setex(
      redisKeys.destination(),
      TTL.destination,
      JSON.stringify(destinations),
    );
    return {
      message: 'all destinations fetched successfully',
      data: destinations,
    };
  };
  updateDestinations = async (data: DestinationDto[]) => {
    await this.destinationRepo.transaction(async (tx) => {
      await tx.destination.deleteMany();
      await tx.destination.createMany({
        data: data,
      });
    });
    await redis.del(redisKeys.destination());
    this.logger.info('Destinations synchronized successfully');
  };
  addDestination = async (data: DestinationDto[]) => {
    await this.destinationRepo.createMany(data);
    this.logger.info('Destination added successfully');
  };
  async onModuleInit() {
    try {
      const destinationsCount = await this.destinationRepo.count({});
      if (destinationsCount > 0) {
        return;
      }
      const destinations = await this.providerService.getDestinations(
        this.config.getOrThrow<string>('COUNTRYCODE'),
      );
      if (!destinations?.length) {
        this.logger.warn(
          'No destinations returned from provider, skipping update',
        );
        return;
      }
      await this.addDestination(destinations);
      this.logger.info('Destinations added successfully');
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to add destinations');
    }
  }
}
