import { Injectable } from '@nestjs/common';
import { DestinationRepository, HotelbedsProvider } from 'src/common';
import { SearchHotelsDto } from './Dto/search.dto';
import { QueryDto } from './Dto/query.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HotelServices {
    private countryCode:string
    constructor(private readonly destinationRepo: DestinationRepository,
        private readonly hotelProvider: HotelbedsProvider,
        private readonly configService: ConfigService,

    ) { 
        this.countryCode = this.configService.getOrThrow<string>('COUNTRYCODE');
    }
    
 async   getAllHotels(filter:SearchHotelsDto,dto: QueryDto) { 
     const hotels = await this.hotelProvider.getHotels()
     console.info(hotels)
     

    }
    getHotelById(hotelId: string) {}
    
}
