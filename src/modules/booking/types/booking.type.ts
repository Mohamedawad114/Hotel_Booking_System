import {
  ObjectType,
  Field,
  Int,
  Float,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { BookingStatus, PaymentType } from '@prisma/client';
registerEnumType(BookingStatus, {
  name: 'BookingStatus',
});

@ObjectType()
export class GuestType {
  @Field(() => String)
  firstName!: string;
  @Field(() => String)
  lastName!: string;
  @Field(() => Int, { nullable: true })
  age?: number;
}

@ObjectType()
export class BookingRoomType {
  @Field(() => ID)
  id!: number;
  @Field(() => Int)
  bookingId!: number;
  @Field(() => String)
  roomCode!: string;
  @Field(() => Int)
  hotelId!: number;
  @Field(() => String)
  rateKey!: string;
  @Field(() => Float)
  price!: number;
  @Field(() => Int)
  adultsCount!: number;
  @Field(() => Int)
  childrenCount!: number;
  @Field(() => [GuestType], { nullable: true })
  guestsData?: GuestType[];
  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class BookingType {
  @Field(() => ID)
  id!: number;
  @Field(() => String)
  bookingNumber!: string;
  @Field(() => Int)
  userId!: number;
  @Field(() => String, { nullable: true })
  providerReference?: string;
  @Field(() => Float)
  totalPrice!: number;
  @Field(() => BookingStatus)
  status!: BookingStatus;
  @Field(() => Date)
  checkIn!: Date;
  @Field(() => Date)
  checkOut!: Date;
  @Field(() => String)
  holderFirstName!: string;
  @Field(() => String)
  holderLastName!: string;
  @Field(() => String)
  holderEmail!: string;
  @Field(() => String)
  holderPhone!: string;
  @Field(() => Int, { nullable: true })
  refundAmount?: number;
  @Field(() => Int, { nullable: true })
  cancellationFees?: number;
  @Field(() => String, { nullable: true })
  cancellationReference?: string;
  @Field(() => PaymentType)
  paymentType!: PaymentType;
  @Field(() => String)
  currency!: string;
  @Field(() => [BookingRoomType])
  rooms!: BookingRoomType[];
  @Field(() => Date)
  createdAt!: Date;
}
