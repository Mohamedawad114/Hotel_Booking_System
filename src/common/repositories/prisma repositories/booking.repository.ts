import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  BookingStatus,
  paymentStatus,
  PaymentType,
  Prisma,
} from '@prisma/client';
import {
  ICancelBookingData,
  IConfirmBookingResult,
} from 'src/common/interfaces';

@Injectable()
export class BookingRepository extends BaseRepository<
  PrismaService['booking'],
  Prisma.bookingUncheckedCreateInput,
  Prisma.bookingUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.booking, prisma);
  }

  async createBooking(
    userId: number,
    bookingNumber: string,
    data: IConfirmBookingResult,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          user: { connect: { id: userId } },
          bookingNumber: bookingNumber,
          providerReference: data.reference,
          totalPrice: data.totalPrice,
          checkIn: data.checkIn,
          status:
            data.paymentType == PaymentType.AT_WEB
              ? BookingStatus.PENDING
              : BookingStatus.CONFIRMED,
          checkOut: data.checkOut,
          currency: data.currency,
          holderFirstName: data.holder.firstName,
          holderLastName: data.holder.lastName,
          holderEmail: data.holder.email,
          holderPhone: data.holder.phone,
          paymentType: data.paymentType,
          rooms: {
            create: data.rooms.map((room) => ({
              roomCode: room.code,
              rateKey: room.rateKey,
              adultsCount: room.adultsCount,
              childrenCount: room.childrenCount,
              price: room.price,
              guestsData: room.guests as unknown as Prisma.InputJsonValue,
              hotelId: room.hotelId,
            })),
          },
        },
        include: { rooms: true },
      });
      return booking;
    });
  }
  async cancelWithRefund(bookingId: number, data: ICancelBookingData) {}
}
