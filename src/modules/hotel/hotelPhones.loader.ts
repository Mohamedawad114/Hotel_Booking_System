import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { HotelPhones } from './types/getAllHotels.type';
import { HotelPhonesRepository } from 'src/common';

@Injectable({ scope: Scope.REQUEST })
export class HotelPhoneLoader {
  constructor(private readonly hotelPhoneRepo: HotelPhonesRepository) {}
  private readonly loader = new DataLoader<number, HotelPhones[]>(
    async (hotelIds) => {
      const phones = await this.hotelPhoneRepo.findByHotelIds(
        hotelIds as number[],
      );
      return hotelIds.map((id) => phones.filter((p) => p.hotelId === id));
    },
  );

  load(hotelId: number) {
    return this.loader.load(hotelId);
  }
}
