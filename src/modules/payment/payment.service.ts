import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RawBodyRequest,
} from '@nestjs/common';
import { BookingStatus, paymentStatus } from '@prisma/client';
import {
  BookingRepository,
  PaymentRepository,
  StripeServices,
  UserRepository,
} from 'src/common';
import { PaymentGateway } from 'src/common/enums/paymentGateway.enums';
import { IUser } from 'src/common/interfaces';
import { PaymentGatewayFactory } from './payment.factory';
import { PaymentInput } from './Dto/paymentInput.dto';
import { Request } from 'express';
import type { PaymentIntent } from 'stripe';

@Injectable()
export class PaymentService {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly PaymentService: PaymentGatewayFactory,
    private readonly userRepo: UserRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly stripeService: StripeServices,
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
      { id: bookingId, status: BookingStatus.CONFIRMED },
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
      booking.payment.gateway,
    );
    const refundResult = await paymentGateway.refund(
      booking.payment.paymentId,
      amount,
    );
    return refundResult;
  }
  async webhook(req: RawBodyRequest<Request>) {
    const event = await this.stripeService.webhook(req);
    const paymentObject = event.data.object as PaymentIntent;
    const { metadata, id: paymentId } = paymentObject;
    const bookingId = metadata?.bookingId;
    if (!bookingId) {
      throw new BadRequestException('Booking ID missing in metadata');
    }
    if (event.type === 'payment_intent.succeeded') {
      await this.bookingRepo.updateOne(
        {
          id: Number(bookingId),
          userId: metadata.userId,
          status: BookingStatus.PENDING,
        },
        {
          status: BookingStatus.CONFIRMED,
          payment: {
            update: {
              where: { paymentId: paymentId, bookingId: Number(bookingId) },
              data: { status: paymentStatus.completed },
            },
          },
        },
      );
    } else if (event.type === 'payment_intent.payment_failed') {
      await this.paymentRepo.updateOne(
        {
          id: paymentId,
          bookingId: bookingId,
          status: paymentStatus.pending,
        },
        {
          status: paymentStatus.failed,
        },
      );
    }
    return { received: true };
  }
}
