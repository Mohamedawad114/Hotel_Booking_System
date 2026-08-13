export interface ICreatedBookingEmail {
  username: string;
  bookingNumber: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
}
export interface ICancelBookingEmail {
  bookingNumber: string;
  hotelName: string;
  refundAmount?:number;
}
