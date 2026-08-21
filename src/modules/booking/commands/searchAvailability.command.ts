import { SearchAvailabilityDto } from '../dto/checkAvailability.dto';

export class SearchAvailabilityCommand {
  constructor(
    public readonly hotelCode: number,
    public readonly dto: SearchAvailabilityDto,
  ) {}
}
