import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { BookingRepository } from 'src/common';
import { PaymentGateway } from 'src/common/enums/paymentGateway.enums';
import { IUser } from 'src/common/interfaces';

@Injectable()
export class PaymentService {
  constructor(private readonly bookingRepo: BookingRepository) {}

     getPaymentGateway() {
         return {
            data:{...PaymentGateway}
        }
    }
  async pay(user: IUser, bookingId: number) {
    const booking = await this.bookingRepo.findOne({
      id: bookingId,
      userId: user.id,
      status: BookingStatus.PENDING,
    });
      if (!booking) throw new NotFoundException('booking not found or confirmed');
      
  }
}
