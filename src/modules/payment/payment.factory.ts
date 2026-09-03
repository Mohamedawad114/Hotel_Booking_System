import { Injectable, BadRequestException } from '@nestjs/common';
import { StripeServices } from 'src/common/Utils/services/stripe/stripe.service';
import { PaymentGateway } from 'src/common/enums/paymentGateway.enums';

@Injectable()
export class PaymentGatewayFactory {
  private readonly gateways = new Map();

  constructor(stripeProvider: StripeServices) {
    this.gateways.set(PaymentGateway.stripe, stripeProvider);
  }

  getGateway(gateway: PaymentGateway) {
    const provider = this.gateways.get(gateway);
    if (!provider) {
      throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
    return provider;
  }
}
