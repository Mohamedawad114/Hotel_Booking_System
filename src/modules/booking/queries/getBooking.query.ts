import { IUser } from 'src/common/interfaces';

export class GetBookingDetails {
  constructor(
    public readonly user: IUser,
    public bookingId: number,
  ) {}
}
