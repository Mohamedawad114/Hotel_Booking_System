export interface Guest {
  firstName: string;
  lastName: string;
  age?: number;
}

export interface IBookingRooms {
  rateKey: string;
  adultsCount: number;
  childrenCount: number;
  guests: Guest[];
}

export interface IHolderInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
export interface IConfirmBookingResult {
  reference: string;
  status: string;
  totalPrice: number;
  checkIn: Date;
  checkOut: Date;
  rooms: {
    code: string;
    hotelId: number;
    rateKey: string;
    price: number;
    adultsCount: number;
    childrenCount: number;
    guests: Guest[];
  }[];
  holder: IHolderInfo;
}
export interface IBooking extends IConfirmBookingResult {
  id: number;
  providerReference: string;
  cancellationReference: string;
  cancellationFees: number;
}
