import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { DestinationRepository, redis, redisKeys, TTL } from 'src/common';
import { type IDestination } from 'src/common/interfaces';

@Injectable()
export class DestinationService implements OnModuleInit {
  constructor(
    private readonly destinationRepo: DestinationRepository,
    private readonly logger: PinoLogger,
  ) {}
  getAllDestinations = async () => {
    const cahchedDestinations = await redis.get(redisKeys.destination());
    if (cahchedDestinations) {
      return {
        message: 'destinations fetched from cache',
        data: JSON.parse(cahchedDestinations),
      };
    }
    const destinations = this.destinationRepo.findMany({}, {});
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
  deleteDestinations = async () => {
    await Promise.all([
      redis.del(redisKeys.destination()),
      this.destinationRepo.deleteMany(),
    ]);
    this.logger.info('All destinations deleted successfully');
  };
  addDestination = async (data: IDestination[]) => {
    await this.destinationRepo.createMany(data);
    this.logger.info('Destination added successfully');
  };
 async onModuleInit() {
      
  }
}
