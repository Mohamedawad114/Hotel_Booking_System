import { type IUser } from "src/common/interfaces";

export class CancelBookingCommand{
    constructor(
        public readonly user: IUser,
        public readonly bookingId:number
    ){}
}