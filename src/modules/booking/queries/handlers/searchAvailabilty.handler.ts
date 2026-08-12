import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchAvailabilityQuery } from '../searchAvailabilty.query';
import { HotelbedsProvider, redis, redisKeys, TTL } from 'src/common';

@QueryHandler(SearchAvailabilityQuery)
export class SearchAvailabilityHandler implements IQueryHandler<SearchAvailabilityQuery> {
  constructor(private readonly hotelProvider: HotelbedsProvider) {}
  async execute(query: SearchAvailabilityQuery) {
    const { hotelCode, dto } = query;
    const cacheKey = redisKeys.availability(hotelCode, dto);
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const result = await this.hotelProvider.checkAvailability(hotelCode, dto);
    const res = {
      message: 'rooms availability',
      data: result,
    };
    await redis.setex(cacheKey, TTL.availability, JSON.stringify(res));
    return res;
  }
}
