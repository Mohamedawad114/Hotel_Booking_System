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
  HotelRepository,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { SearchHotelsDto } from './Dto/search.dto';
import { QueryDto } from './Dto/query.dto';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { type IHotel } from 'src/common/interfaces';

@Injectable()
export class HotelServices implements OnModuleInit {
  private countryCode: string;
  constructor(
    private readonly destinationRepo: DestinationRepository,
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
    const lastItem = hotels[hotels.length - 1];
    const nextCursor = encodedCursor({
      createdAt: lastItem.createdAt,
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
    if (hotel) throw new NotFoundException('hotel not found');
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
  updateHotels = async (data: IHotel[]) => {
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
      const hotels = await this.hotelRepo.count();
      if (hotels > 0) return;
      const data = await this.hotelProvider.getHotels(this.countryCode);
      if (!data?.length) {
        this.logger.warn('No hotels returned from provider, skipping seed');
        return;
      }
      await this.addHotels(data);
    } catch (err) {
      this.logger.error('Failed to seed hotels on module init');
      throw err;
    }
  }
  hotelRooms = async () => {};
}
