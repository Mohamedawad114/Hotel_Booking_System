import {
  BadRequestException,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/common/interfaces';
import { StripeInput } from 'src/modules/payment/Dto/stripeInput.dto';
import Stripe from 'stripe';
import { Request } from 'express';
@Injectable()
export class StripeServices {
  private readonly stripe: Stripe;
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET'),
    );
  }

  async createCustomerId(user: IUser): Promise<string> {
    const customer = await this.stripe.customers.create({
      name: user.name,
      email: user.email,
      metadata: { userId: user.id },
    });
    return customer.id;
  }
  async pay(data: StripeInput) {
    try {
      const payment = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency.toLowerCase(),
        customer: data.customerId,
        receipt_email: data.email,
        automatic_payment_methods: { enabled: true },
        capture_method: data.captureMethod,
        off_session: data.offSession,
        amount_details: data.amountDetails,
        metadata: {
          bookingId: data.bookingId,
          userId: data.userId,
          ...data.metadata,
        },
      });
      return { clientSecret: payment.client_secret, id: payment.id };
    } catch (err: any) {
      throw new BadRequestException(
        `payment failed: ${err.message || 'Unknown stripe error'}`,
      );
    }
  }
  async refund(paymentId: string, amount: number) {
    try {
      return await this.stripe.refunds.create({
        payment_intent: paymentId,
        ...(amount && { amount: Math.round(amount * 100) }),
      });
    } catch (error: any) {
      throw new BadRequestException(
        `Refund failed: ${error.message || 'Unknown stripe error'}`,
      );
    }
  }
  async retrievePaymentIntent(paymentIntentId: string) {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
  async webhook(req: RawBodyRequest<Request>) {
    try {
      const signature = req.headers['stripe-signature'];
      const payload = req.rawBody;
      const secret = this.configService.getOrThrow<string>('WEBHOOK_SECRET');
      if (!signature || !payload) {
        throw new BadRequestException('Missing stripe-signature or raw body');
      }
      const event = this.stripe.webhooks.constructEvent(
        payload!,
        signature!,
        secret,
      );
      return event;
    } catch (err: any) {
      console.error('❌ STRIPE WEBHOOK ERROR:', err.message);
      console.error(err);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
