import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { PaymentGateway, paymentStatus } from '@prisma/client';
import { BookingType } from './booking.type';
registerEnumType(paymentStatus, { name: 'paymentStatus' });
registerEnumType(PaymentGateway, { name: 'paymentGateway' });
@ObjectType()
export class Payment {
  @Field(() => Float)
  amount!: number;
  @Field(() => String)
  paymentId!: string;
  @Field(() => Date, { nullable: true })
  paidAt?: Date;
  @Field(() => paymentStatus)
  status!: paymentStatus;
  @Field(() => Int)
  bookingId!: number;
  @Field(() => Date)
  updatedAt!: Date;
  @Field(() => PaymentGateway)
  gateway!: PaymentGateway;
  @Field(() => Date)
  createdAt!: Date;
}
@ObjectType()
export class bookingDetails extends BookingType {
  @Field(() => Payment, { nullable: true })
  payment?: Payment;
}
