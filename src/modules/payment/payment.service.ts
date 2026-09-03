import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RawBodyRequest,
} from '@nestjs/common';
import { BookingStatus, paymentStatus } from '@prisma/client';
import { PaymentGateway } from 'src/common/enums/paymentGateway.enums';
import { IUser } from 'src/common/interfaces';
import { PaymentGatewayFactory } from './payment.factory';
import { PaymentInput } from './Dto/paymentInput.dto';
import { Request } from 'express';
import type { PaymentIntent } from 'stripe';
import { BookingRepository } from 'src/common/repositories/prisma repositories/booking.repository';
import { WebhookProducer } from 'src/common/Utils/services/Jobs/webhook/webhook.job.producer';
import { UserRepository } from 'src/common/repositories/prisma repositories/user.repository';
import { PaymentRepository } from 'src/common/repositories/prisma repositories/payment.repository';
import { StripeServices } from 'src/common/Utils/services/stripe/stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly userRepo: UserRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly stripeService: StripeServices,
    private readonly webhookQueue: WebhookProducer,
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
    const paymentGateway = this.paymentGatewayFactory.getGateway(data.gateway);
    let customerId = user.customer_id;
    if (!customerId && typeof paymentGateway.createCustomerId === 'function') {
      customerId = await paymentGateway.createCustomerId(user);
      await this.userRepo.updateOne(
        { id: user.id },
        { customer_id: customerId },
      );
      user.customer_id = customerId;
    }
    const existingPayment = await this.paymentRepo.findOne(
      {
        bookingId: booking.id,
        status: { in: [paymentStatus.completed, paymentStatus.pending] },
      },
      { select: { id: true, paymentId: true } },
    );
    if (existingPayment) {
      const paymentIntent = await this.stripeService.retrievePaymentIntent(
        existingPayment.paymentId,
      );
      return {
        message: 'Payment already initialized',
        data: {
          clientSecret: paymentIntent.client_secret,
          id: existingPayment.paymentId,
          bookingId,
        },
        meta: { gateway: existingPayment.gateway },
      };
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
    const paymentGateway = this.paymentGatewayFactory.getGateway(
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
      const booking = await this.bookingRepo.findById(parseInt(bookingId), {
        select: { bookingNumber: true, id: true },
      });
      if (!booking) return { data: { ignored: true } };
      await this.bookingRepo.updateOne(
        {
          id: Number(bookingId),
          userId: Number(metadata.userId),
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
      await this.webhookQueue.addWebhookJob(
        Number(bookingId),
        Number(metadata.userId),
      );
    } else if (event.type === 'payment_intent.payment_failed') {
      await this.paymentRepo.updateOne(
        {
          paymentId: paymentId,
          bookingId: bookingId,
          status: paymentStatus.pending,
        },
        {
          status: paymentStatus.failed,
        },
      );
      return { data: { failed: true } };
    }
    return { received: true };
  }
  getMyPayments = async (user: IUser, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.paymentRepo.findMany(
        { userId: user.id },
        {
          take: limit,
          skip: offset,
          select: {
            amount: true,
            id: true,
            paymentId: true,
            paidAt: true,
            status: true,
          },
        },
      ),
      this.paymentRepo.count({ userId: user.id }),
    ]);
    return {
      message: 'all your payments',
      data: payments,
      meta: {
        total,
        pages: Math.round(total / limit),
      },
    };
  };
  getPaymentDetails = async (user: IUser, paymentId: number) => {
    const paymentDetails = await this.paymentRepo.findUnique({
      userId: user.id,
      id: paymentId,
    });
    if (!paymentDetails) throw new NotFoundException('payment not Found');
    return {
      message: 'paymentDetails',
      data: paymentDetails,
    };
  };
}
