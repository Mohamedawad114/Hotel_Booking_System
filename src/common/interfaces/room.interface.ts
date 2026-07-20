export interface IRoom {
  code: string;
  hotelId: number;
  maxAdults: number;
  maxChildren: number;
  description?: string;
  roomType: string;
  isParentRoom:boolean;
  roomCategory: string;
  createdAt?: Date
  id?:number
}
