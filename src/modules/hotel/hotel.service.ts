import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  decoderCursor,
  DestinationRepository,
  encodedCursor,
  HotelbedsProvider,
  HotelFacilityRepository,
  HotelRepository,
  redis,
  redisKeys,
  RoomRepository,
  RoomFacilityRepository,
  TTL,
  FacilityRepository,
} from 'src/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import {
  IHotelFacilities,
  IRoom,
  IRoomFacilities,
  type IHotel,
} from 'src/common/interfaces';
import { SearchArgs } from './Dto/search.dto';

@Injectable()
export class HotelServices implements OnModuleInit {
  private countryCode: string;
  constructor(
    private readonly destinationRepo: DestinationRepository,
    private readonly roomRepo: RoomRepository,
    private readonly facilityRepo: FacilityRepository,
    private readonly roomFacilityRepo: RoomFacilityRepository,
    private readonly hotelFacilityRepo: HotelFacilityRepository,
    private readonly hotelProvider: HotelbedsProvider,
    private readonly logger: PinoLogger,
    private readonly hotelRepo: HotelRepository,
    private readonly configService: ConfigService,
  ) {
    this.countryCode = this.configService.getOrThrow<string>('COUNTRYCODE');
  }

  async getAllHotels(query?: SearchArgs) {
    const cursorDecoded = decoderCursor(query?.cursor);
    const sortedField =
      cursorDecoded?.sortedField ??
      (query?.rating ? 'rating' : query?.ranking ? 'ranking' : 'createdAt');
    const cacheKey = redisKeys.getHotels(query, sortedField);
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    if (query?.destinationCode) {
      const isExited = await this.destinationRepo.findOne(
        { code: query.destinationCode },
        { select: { id: true, code: true } },
      );
      if (!isExited) throw new NotFoundException('destination code not found');
    }
    const hotels = await this.hotelRepo.getHotels(query, {
      ...cursorDecoded,
    });
    if (!hotels.length) throw new BadRequestException('no hotels found');
    const lastItem = hotels[hotels.length - 1];
    const nextCursor = encodedCursor({
      id: lastItem.id,
      value: lastItem[sortedField]!,
      sortedField: sortedField,
    });
    const res = {
      data: hotels,
      meta: { nextCursor: nextCursor },
    };
    await redis.setex(cacheKey, TTL.hotels, JSON.stringify(res));
    return res;
  }
  async getHotelById(hotelId: number) {
    if (!hotelId) throw new BadRequestException('hotelId is required');
    const cached = await redis.get(redisKeys.hotelDetail(hotelId));
    if (cached) return JSON.parse(cached);
    const hotel = await this.hotelRepo.findById(hotelId, {
      include: { phones: true },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    const res = {
      message: 'hotel details',
      data: hotel,
    };
    await redis.setex(
      redisKeys.hotelDetail(hotel.id),
      TTL.hotels,
      JSON.stringify(res),
    );
    return res;
  }
  async getHotelFacilities(hotelId: number) {
    if (!hotelId) throw new BadRequestException('hotelId is required');
    const cached = await redis.get(redisKeys.hotelFacilities(hotelId));
    if (cached) return JSON.parse(cached);
    const hotel = await this.hotelRepo.findById(hotelId, {
      select: { id: true, code: true },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    const facilities = await this.hotelFacilityRepo.findMany(
      {
        hotelId: hotel.id,
      },
      { select: { id: true, facility: { select: { name: true, id: true } } } },
    );
    if (!facilities.length) return { message: 'no facilities for this hotel ' };
    const res = {
      message: 'hotel facilities',
      data: facilities,
    };
    await redis.setex(
      redisKeys.hotelFacilities(hotelId),
      TTL.hotelFacilities,
      JSON.stringify(res),
    );
    return res;
  }
  async updateHotelsData(data: {
    allHotels: IHotel[];
    allHotelFacilities: IHotelFacilities[];
    allRooms: IRoom[];
    allRoomFacilities: IRoomFacilities[];
  }): Promise<void> {
    this.logger.info(`بدء تحديث ${data.allHotels.length} فندق في الداتابيز...`);
    await this.batchUpsert(
      data.allHotels,
      (hotel) => this.hotelRepo.upsert(hotel, { code: hotel.code }),
      'hotels',
    );
    await this.batchUpsert(
      data.allRooms,
      (room) =>
        this.roomRepo.upsert(room, {
          hotelId_code: { hotelId: room.hotelId, code: room.code },
        }),
      'rooms',
    );
    await this.batchUpsert(
      data.allHotelFacilities,
      (fac) =>
        this.hotelFacilityRepo.upsert(fac, {
          hotelId_facilityCode: {
            hotelId: fac.hotelId,
            facilityCode: fac.facilityCode,
          },
        }),
      'hotel facilities',
    );
    await this.batchUpsert(
      data.allRoomFacilities,
      (rf) =>
        this.roomFacilityRepo.upsert(rf, {
          roomCode_facilityCode: {
            roomCode: rf.roomCode,
            facilityCode: rf.facilityCode,
          },
        }),
      'room facilities',
    );
    this.logger.info('✅ تم مزامنة وتحديث جميع الفنادق بنجاح!');
  }

  async onModuleInit() {
    try {
      const hotels = await this.hotelRepo.count();
      const rooms = await this.roomRepo.count();
      if (hotels > 0 && rooms > 0) return;
      const {
        allHotelFacilities,
        allHotels,
        allRoomFacilities,
        allRooms,
        allHotelPhones,
      } = await this.hotelProvider.getData(this.countryCode);
      if (!allHotels.length || !allRooms.length) {
        this.logger.warn(
          'No hotels or rooms returned from provider, skipping seed',
        );
        return;
      }
      const validFacilities = await this.facilityRepo.findMany(
        {},
        {
          select: { code: true, groupCode: true },
        },
      );
      const validKeysSet = new Set(
        validFacilities.map((f) => `${f.code}-${f.groupCode}`),
      );
      const parsedRoomFacilities = allRoomFacilities.filter((rf) =>
        validKeysSet.has(`${rf.facilityCode}-${rf.facilityGroupCode}`),
      );
      const parsedHotelFacilities = allHotelFacilities.filter((rf) =>
        validKeysSet.has(`${rf.facilityCode}-${rf.facilityGroupCode}`),
      );
      await this.hotelRepo.transaction(
        async (tx) => {
          await tx.hotel.createMany({
            data: allHotels,
            skipDuplicates: true,
          });
          await tx.room.createMany({
            data: allRooms,
            skipDuplicates: true,
          });
          await tx.roomFacilities.createMany({
            data: parsedRoomFacilities,
            skipDuplicates: true,
          });
          await tx.hotelFacilities.createMany({
            data: parsedHotelFacilities,
            skipDuplicates: true,
          });
          await tx.hotelPhone.createMany({
            data: allHotelPhones,
            skipDuplicates: true,
          });
        },
        { timeout: 60000 },
      );
      this.logger.info(`data seed successfully`);
    } catch (err) {
      this.logger.error('Failed to seed hotels on module init');
      throw err;
    }
  }
  private async batchUpsert<T>(
    items: T[],
    upsertFn: (item: T) => Promise<any>,
    label: string,
    batchSize = 50,
  ): Promise<void> {
    let succeeded = 0;
    let failed = 0;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const results = await Promise.allSettled(batch.map(upsertFn));
      for (const r of results) {
        if (r.status === 'fulfilled') succeeded++;
        else {
          failed++;
          this.logger.error(`فشل upsert لـ ${label}: ${r.reason?.message}`);
        }
      }
    }
    this.logger.info(
      `${label}: ${succeeded} نجح، ${failed} فشل من ${items.length}.`,
    );
  }
}
