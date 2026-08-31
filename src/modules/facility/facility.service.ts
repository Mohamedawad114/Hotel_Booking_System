import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  decoderCursor,
  encodedCursor,
  FacilityRepository,
  HotelbedsProvider,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { AddFacility } from './dto/addFacility.dto';
import { IFacility } from 'src/common/interfaces';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class FacilityService implements OnModuleInit {
  constructor(
    private readonly facilityRepo: FacilityRepository,
    private readonly logger: PinoLogger,
    private readonly providerService: HotelbedsProvider,
  ) {}
  getAllFacilities = async (query: QueryDto) => {
    const cahchedFacilities = await redis.get(redisKeys.facility());
    if (cahchedFacilities) {
      return JSON.parse(cahchedFacilities);
    }
    const decodedCursor = decoderCursor(query.cursor);
    const facilities = await this.facilityRepo.findMany(
      {},
      {
        skip: decodedCursor ? 1 : 0,
        cursor: decodedCursor
          ? { id: decodedCursor.id, createdAt: decodedCursor.value }
          : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: query.limit || 20,
      },
    );
    const lastItem = facilities[facilities.length - 1];
    const nextCursor = encodedCursor({
      id: lastItem.id,
      value: lastItem.createdAt,
    });
    const res = {
      message: 'all facilities fetched successfully',
      data: facilities,
      meta: { nextCursor },
    };
    await redis.setex(
      redisKeys.facility(),
      TTL.facilities,
      JSON.stringify(res),
    );
    return res;
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
