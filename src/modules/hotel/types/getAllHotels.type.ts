import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { IHotel, IHotelPhone } from 'src/common/interfaces';

@ObjectType({ description: 'hotels details' })
export class Hotel implements IHotel {
  @Field(() => Number)
  id!: number;
  @Field(() => Number)
  code!: number;
  @Field(() => String)
  name!: string;
  @Field(() => String, { nullable: true })
  email?: string;
  @Field(() => String)
  web!: string;
  @Field(() => String)
  address!: string;
  @Field(() => String)
  description!: string;
  @Field(() => Int)
  ranking!: number;
  @Field(() => Int)
  rating!: number;
  @Field(() => Float, { nullable: true })
  latitude?: number;
  @Field(() => Float, { nullable: true })
  longitude?: number;
  @Field(() => String)
  city!: string;
  @Field(() => String)
  destinationCode!: string;
  @Field(() => String)
  countryCode!: string;
  @Field(() => [String])
  images!: string[];
}

@ObjectType()
export class HotelPhones implements IHotelPhone {
  @Field(() => Int)
  id?: number;
  @Field(() => Int)
  hotelId!: number;
  @Field(() => String)
  phoneNumber!: string;
  @Field(() => String)
  phoneType!: string;
}

@ObjectType()
export class MetaData {
  @Field(() => String)
  nextCursor?: string;
}

@ObjectType()
export class HotelsResponse {
  @Field(() => [Hotel])
  data!: Hotel[];
  @Field(() => MetaData, { nullable: true })
  meta?: MetaData;
}
