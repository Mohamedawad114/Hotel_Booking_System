import {  IUser } from "src/common/interfaces";

export class ConfirmBookingEvent {
  constructor(
    public readonly user: IUser,
    public readonly hotelCode:number,
    public readonly booking
  ) {}
}
