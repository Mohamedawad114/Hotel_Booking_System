import { IDestination } from './destination.interface';
import { IFacility } from './facility.interface';

export interface IProviderService {
  getDestinations(countryCode: string): Promise<IDestination[]>;
  getFacilities(): Promise<IFacility[]>;
  getData(countryCode: string);
}
