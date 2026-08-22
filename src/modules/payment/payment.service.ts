import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, paymentStatus } from '@prisma/client';
import {
  BookingRepository,
  PaymentRepository,
  UserRepository,
} from 'src/common';
import { PaymentGateway } from 'src/common/enums/paymentGateway.enums';
import { IUser } from 'src/common/interfaces';
import { PaymentGatewayFactory } from './payment.factory';
import { PaymentInput } from './Dto/paymentInput.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly PaymentService: PaymentGatewayFactory,
    private readonly userRepo: UserRepository,
    private readonly paymentRepo: PaymentRepository,
  ) {}

  getPaymentGateway() {
    return {
      data: Object.values(PaymentGateway),
    };
  }
  async pay(user: IUser, bookingId: number, data: PaymentInput) {
    const booking = await this.bookingRepo.findOne({
      id: bookingId,
      userId: user.id,
      status: BookingStatus.PENDING,
    });
    if (!booking) throw new NotFoundException('booking not found or confirmed');
    const paymentGateway = this.PaymentService.getGateway(data.gateway);
    let customerId = user.customer_id;
    if (!customerId && typeof paymentGateway.createCustomerId === 'function') {
      customerId = await paymentGateway.createCustomerId(user);
      await this.userRepo.updateOne(
        { id: user.id },
        { customer_id: customerId },
      );
      user.customer_id = customerId;
    }
    const paymentResult = await paymentGateway.pay({
      amount: booking.totalPrice,
      currency: booking.currency || 'EGP',
      email: user.email,
      userId: user.id,
      bookingId: booking.id,
      customerId: customerId,
      ...data,
    });
    const now = new Date();
    await this.paymentRepo.create({
      booking: { connect: { id: bookingId } },
      user: { connect: { id: user.id } },
      paidAt: now,
      paymentId: paymentResult.id,
      status: paymentStatus.pending,
      currency: booking.currency,
      amount: booking.totalPrice,
      gateway: data.gateway,
    });
    return {
      message: 'Payment initialized successfully',
      data: {
        clientSecret: paymentResult.clientSecret,
        id: paymentResult.id,
        bookingId,
      },
      meta: { gateway: data.gateway },
    };
  }
  async refund(bookingId: number, amount: number) {
    const booking = await this.bookingRepo.findOne(
      { id: bookingId },
      {
        select: {
          payment: true,
          status: true,
          refundAmount: true,
        },
      },
    );
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.payment.status.Refund === paymentStatus.Refund) {
      throw new BadRequestException(
        `Booking is already canceled with refunded amount ${booking.refundAmount}`,
      );
    }
    if (!booking.payment.paymentId) {
      throw new BadRequestException(
        'No payment reference (paymentId) attached to this booking',
      );
    }
    const paymentGateway = this.PaymentService.getGateway(
      booking.paymentGateway,
    );
    const refundResult = await paymentGateway.refund(
      booking.payment.paymentId,
      amount,
    );
    return refundResult;
  }
}
