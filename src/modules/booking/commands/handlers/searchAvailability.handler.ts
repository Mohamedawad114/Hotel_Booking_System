import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HotelbedsProvider, redis, redisKeys, TTL } from 'src/common';
import { BadRequestException } from '@nestjs/common';
import { SearchAvailabilityCommand } from '../searchAvailability.command';

@CommandHandler(SearchAvailabilityCommand)
export class SearchAvailabilityHandler implements ICommandHandler<SearchAvailabilityCommand> {
  constructor(private readonly hotelProvider: HotelbedsProvider) {}
  async execute(query: SearchAvailabilityCommand) {
    const { hotelCode, dto } = query;
    const cacheKey = redisKeys.availability(hotelCode, dto);
    const cached = await redis.get(cacheKey);
    // if (cached) return JSON.parse(cached);
    if (dto.checkIn < new Date())
      throw new BadRequestException(
        'check in must be greater than or equal now',
      );
    if (new Date(dto.checkOut) <= new Date(dto.checkIn)) 
      throw new BadRequestException(
        'Check-out date must be after check-in date',
      );
    const result = await this.hotelProvider.checkAvailability(hotelCode, dto);
    const res = {
      message: 'rooms availability',
      data: result,
    };
    await redis.setex(cacheKey, TTL.availability, JSON.stringify(res));
    return res;
  }
}
