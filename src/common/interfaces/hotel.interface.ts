
export interface IHotel {
  id: number;
  code: number;
  name: string;
  description: string;
  email: string;
  address: string;
  images: string[];
  web: string;
  ranking: number;
  rating: number;
  latitude?: number;
  longitude?: number;
  destinationCode: string;
  city: string;
  countryCode: string;
  createdAt?: Date;
}

export interface IHotelCursor {
  createdAt?: Date;
  limit?: number;
  id?: number;
}
export interface IHotelPhone {
  id?: number;
  hotelId: number;
  phoneNumber: string;
  phoneType: string;
}
