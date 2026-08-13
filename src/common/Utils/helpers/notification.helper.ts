import { NotificationTitle } from "src/common/enums/notification.enum";

export const notificationContent = {
  [NotificationTitle.createdBooking]: (
    bookingNumber: string,
    totalPrice: number,
  ) =>
    `Your booking #${bookingNumber} has been created successfully. Total price: ${totalPrice}  .`,

  [NotificationTitle.canceledBooking]: (bookingNumber: string) =>
    `Your booking #${bookingNumber} has been canceled. `,

  [NotificationTitle.confirmedBooking]: (
    bookingNumber: string,
    totalPrice: number,
  ) =>
    `Your booking #${bookingNumber} has been confirmed successfully. Total price: ${totalPrice} .`,
};
