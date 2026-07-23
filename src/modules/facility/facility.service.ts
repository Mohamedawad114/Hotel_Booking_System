import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  FacilityRepository,
  HotelbedsProvider,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { AddFacility } from './dto/addFacility.dto';
import { IFacility } from 'src/common/interfaces';

@Injectable()
export class FacilityService implements OnModuleInit {
  constructor(
    private readonly facilityRepo: FacilityRepository,
    private readonly logger: PinoLogger,
    private readonly providerService: HotelbedsProvider,
  ) {}
  getAllFacilities = async () => {
    const cahchedFacilities = await redis.get(redisKeys.facility());
    if (cahchedFacilities) {
      return {
        message: 'facilities fetched from cache',
        data: JSON.parse(cahchedFacilities),
      };
    }
    const facilities = await this.facilityRepo.findMany({}, {});
    await redis.setex(
      redisKeys.facility(),
      TTL.facilities,
      JSON.stringify(facilities),
    );
    return {
      message: 'all facilities fetched successfully',
      data: facilities,
    };
  };
  updateFacilities = async (data: AddFacility[]) => {
    for (const facility of data) {
      await this.facilityRepo.upsert(facility);
    }
    await redis.del(redisKeys.destination());
    this.logger.info('facilities synchronized successfully');
  };
  addFacilities = async (data: IFacility[]) => {
    await this.facilityRepo.createMany(data, { skipDuplicates: true });
    this.logger.info('facilities added successfully');
  };
  async onModuleInit() {
    try {
      const facilitiesCount = await this.facilityRepo.count({});
      if (facilitiesCount > 0) {
        return;
      }
      const facilities = await this.providerService.getFacilities();
      if (!facilities?.length) {
        this.logger.warn(
          'No facilities returned from provider, skipping update',
        );
        return;
      }
      await this.addFacilities(facilities);
      this.logger.info('Destinations added successfully');
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to add facilities');
      throw error;
    }
  }
}
