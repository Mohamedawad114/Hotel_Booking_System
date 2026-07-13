export interface IHotel {
  id:number
  code: number;
  name: string;
  description: string;
  address: string;
  phone: string[];
  images: string[];
  web: string;
  ranking: number;
  rating: number;
  latitude?: number;
  longitude?: number;
  destinationCode: string;
  city: string;
  countryCode: string;
  createdAt:Date
}

export interface IHotelCursor {
  createdAt?: Date;
  limit?: number;
  id?: number;
}
