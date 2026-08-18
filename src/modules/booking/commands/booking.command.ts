import { IUser } from 'src/common/interfaces';
import { BookingInput } from '../dto/booking.dto';

export class BookingCommand {
  constructor(
    public readonly user: IUser,
    public readonly hotelCode: number,
    public readonly idempotencyKey: string,
    public readonly dto: BookingInput,
  ) {}
}
