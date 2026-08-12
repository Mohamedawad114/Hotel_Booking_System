import { SearchAvailabilityDto } from '../dto/checkAvailability.dto';

export class SearchAvailabilityQuery {
  constructor(
    public readonly hotelCode: number,
    public readonly dto: SearchAvailabilityDto,
  ) {}
}
