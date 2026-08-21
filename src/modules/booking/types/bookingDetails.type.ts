import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { paymentStatus } from '@prisma/client';
import { BookingType } from './booking.type';
 registerEnumType(paymentStatus,{name:"paymentStatus"})
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
  @Field(() => Date)
  createdAt!: Date;
}
@ObjectType()
export class bookingDetails extends BookingType {
  @Field(() => Payment, { nullable: true })
  payment?: Payment;
}
