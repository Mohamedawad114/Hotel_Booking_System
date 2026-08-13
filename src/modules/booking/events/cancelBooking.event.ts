import { type IUser } from 'src/common/interfaces';

export class CancelBookingEvent {
  constructor(
    public readonly user: IUser,
    public readonly booking,
    public readonly refundAmount?: number,
  ) {}
}
