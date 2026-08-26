export interface ICreatedBookingEmail {
  name: string;
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

export interface IWebhookQueue {
  name: string;
  paymentId: string;
  totalPrice: number;
  bookingNumber: string;
  userId: number;
  hotelName: string;
  checkIn: string;
  checkOut: string;
}  