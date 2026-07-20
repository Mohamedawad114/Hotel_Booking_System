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
} from 'src/common';
import { SearchHotelsDto } from './Dto/search.dto';
import { QueryDto } from './Dto/query.dto';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { type IHotel } from 'src/common/interfaces';
import { searchRoomsDto } from './Dto/searchRooms.dto';

@Injectable()
export class HotelServices implements OnModuleInit {
  private countryCode: string;
  constructor(
    private readonly destinationRepo: DestinationRepository,
    private readonly roomRepo: RoomRepository,
    private readonly roomFacilityRepo: RoomFacilityRepository,
    private readonly hotelFacilityRepo: HotelFacilityRepository,
    private readonly hotelProvider: HotelbedsProvider,
    private readonly logger: PinoLogger,
    private readonly hotelRepo: HotelRepository,
    private readonly configService: ConfigService,
  ) {
    this.countryCode = this.configService.getOrThrow<string>('COUNTRYCODE');
  }

  async getAllHotels(filter?: SearchHotelsDto, query?: QueryDto) {
    const limit = query?.limit || 20;
    const cursor = decoderCursor(query?.cursor);
    const cached = await redis.get(
      redisKeys.getHotels(
        filter?.countryCode,
        JSON.stringify(cursor),
        query?.limit,
      ),
    );
    if (cached) return JSON.parse(cached);
    if (filter?.destinationCode) {
      const isExited = await this.destinationRepo.findOne(
        filter.destinationCode,
        { select: { id: true, code: true } },
      );
      if (!isExited) throw new NotFoundException('destination code not found');
    }
    const hotels = (await this.hotelRepo.getHotels(filter, {
      ...cursor,
      limit,
    })) as IHotel[];
    if (!hotels.length) throw new BadRequestException('no hotels found');
    const lastItem = hotels[hotels.length - 1];
    const nextCursor = encodedCursor({
      createdAt: lastItem.createdAt as Date,
      id: lastItem.id,
    });
    const res = {
      message: 'hotels',
      data: hotels,
      meta: nextCursor,
    };
    await redis.setex(
      redisKeys.getHotels(this.countryCode, nextCursor),
      TTL.hotels,
      JSON.stringify(res),
    );
    return res;
  }
  async getHotelById(hotelId: number) {
    if (!hotelId) throw new BadRequestException('hotelId is required');
    const cached = await redis.get(redisKeys.hotelDetail(hotelId));
    if (cached) return JSON.parse(cached);
    const hotel = await this.hotelRepo.findById(hotelId);
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
    const facilities = await this.hotelFacilityRepo.findMany({
      hotelId: hotel.id,
    });
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
  async getHotelRooms(
    hotelId: number,
    filter: searchRoomsDto,
    cursor?: string,
    limit?: number,
  ) {
    if (!hotelId) throw new BadRequestException('hotelId is required');
    const cursorDecoded = decoderCursor(cursor);
    const cached = await redis.get(
      redisKeys.hotelRooms(hotelId, cursor, limit),
    );
    if (cached) return JSON.parse(cached);
    const rooms = await this.roomRepo.getHotelRooms(hotelId, filter, {
      limit: limit || 20,
      createdAt: cursorDecoded?.createdAt,
      id: cursorDecoded?.id,
    });
    if (!rooms || !rooms.length)
      throw new NotFoundException('hotel no have rooms');
    const lastItem = rooms[rooms.length - 1];
    const nextCursor = encodedCursor({
      createdAt: lastItem.createdAt!,
      id: lastItem.id!,
    });
    const res = {
      message: 'hotel rooms',
      data: rooms,
      meta: { nextCursor },
    };
    await redis.setex(
      redisKeys.hotelRooms(hotelId),
      TTL.hotelRooms,
      JSON.stringify(res),
    );
    return res;
  }
  async getRoomFacilities(roomId: number) {
    if (!roomId) throw new BadRequestException('room id is required');
    const cached = await redis.get(redisKeys.roomFacilities(roomId));
    if (cached) return JSON.parse(cached);
    const room = await this.roomRepo.findById(roomId, {
      select: { id: true, code: true },
    });
    if (!room) throw new NotFoundException('room not found');
    const facilities = await this.roomFacilityRepo.findMany({
      code: room.code,
    });
    if (!facilities.length) return { message: 'no facilities for this room' };
    const res = {
      message: 'room facilities',
      data: facilities,
    };
    await redis.setex(
      redisKeys.roomFacilities(roomId),
      TTL.roomFacilities,
      JSON.stringify(res),
    );
    return res;
  }
  updateHotelsData = async (data: IHotel[]) => {
    this.logger.info(`بدء تحديث ${data.length} فندق في الداتابيز...`);
    for (const hotel of data) {
      await this.hotelRepo.upsert({ code: hotel.code }, hotel);
    }
    this.logger.info('✅ تم مزامنة وتحديث جميع الفنادق بنجاح!');
  };
  addHotels = async (data: IHotel[]) => {
    await this.hotelRepo.createMany(data, {
      skipDuplicates: true,
    });
    this.logger.info('hotels added successfully');
  };
  async onModuleInit() {
    try {
      // const hotels = await this.hotelRepo.count();
      // if (hotels > 0) return;
      // const data = await this.hotelProvider.getData(this.countryCode);
      // if (!data?.length) {
      //   this.logger.warn('No hotels returned from provider, skipping seed');
      //   return;
      // }
      // await this.addHotels(data);
    } catch (err) {
      this.logger.error('Failed to seed hotels on module init');
      throw err;
    }
  }
}
