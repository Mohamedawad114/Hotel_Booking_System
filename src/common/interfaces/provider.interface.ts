import { IDestination } from './destination.interface';
import { IHotel } from './hotel.interface';

export interface IProviderService {
  getDestinations(countryCode: string): Promise<IDestination[]>;
  getHotels(filter: any): Promise<IHotel[]>;
  getHotelDetails(hotelId: string): Promise<IHotel>;
}
