import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { PinoLogger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';
import { IDestination } from 'src/common/interfaces';
import { IHotel } from 'src/common/interfaces/hotel.interface';
import { IProviderService } from 'src/common/interfaces/provider.interface';
import { SearchHotelsDto } from 'src/modules/hotel/Dto/search.dto';
import { QueryDto } from 'src/modules/hotel/Dto/query.dto';

@Injectable()
export class HotelbedsProvider implements IProviderService, OnModuleInit {
  private readonly apiKey: string;
  private readonly secret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.config.getOrThrow<string>('APIKEY');
    this.secret = this.config.getOrThrow<string>('APISECRET');
  }
  onModuleInit() {
    const axiosRef = this.httpService.axiosRef;
    axiosRef.defaults.baseURL = this.config.get(
      'HOTELBEDS_BASE_URL',
      this.config.getOrThrow<string>('PROVIDERURL'),
    );
    axiosRef.defaults.headers.common['Content-Type'] = 'application/json';
    axiosRef.defaults.headers.common['Accept'] = 'application/json';
    axiosRef.interceptors.request.use((req) => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = crypto
        .createHash('sha256')
        .update(this.apiKey + this.secret + timestamp)
        .digest('hex');
      req.headers['Api-key'] = this.apiKey;
      req.headers['X-Signature'] = signature;
      return req;
    });
    this.logger.info('Hotelbeds initialized successfully.');
  }

  async getDestinations(countryCode: string): Promise<IDestination[]> {
    try {
      const allDestinations: IDestination[] = [];
      let from = 1,
        hasMore = true;
      while (hasMore) {
        const response = await firstValueFrom(
          this.httpService.get(
            '/hotel-content-api/1.0/locations/destinations',
            {
              params: { fields: 'all', language: 'ENG', from, to: from + 999 },
            },
          ),
        );
        const batch = response.data?.destinations || [];
        allDestinations.push(
          ...batch
            .filter(
              (d: any) =>
                d.countryCode?.toUpperCase() === countryCode.toUpperCase(),
            )
            .map((d: any) => ({
              code: d.code,
              name: d.name?.content ?? d.code,
              countryCode: d.countryCode,
            })),
        );
        batch.length < 1000 ? (hasMore = false) : (from += 1000);
      }
      this.logger.info(
        ` ${allDestinations.length} destinations fetched successfully from ${countryCode}.`,
      );
      return allDestinations;
    } catch (error: any) {
      this.logger.error(`Failed to fetch destinations: ${error.message}`);
      throw error;
    }
  }
  async getHotels(filter?: SearchHotelsDto, query?: QueryDto) {
    try {
      const params = {
        ...filter,
        fields: 'all',
        language: 'ENG',
        countryCode: this.config.getOrThrow<string>('COUNTRYCODE'),
        limit: query?.limit || 100,
        cursor: query?.cursor || undefined,
      };
      const response$ = this.httpService.get('/hotel-content-api/1.0/hotels', {
        params,
      });
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error: any) {
      this.logger.error(`فشل جلب الـ hotels: ${error.message}`);
      throw error;
    }
  }

  async getHotelDetails(hotelId: string): Promise<IHotel> {
    throw new Error('Method not implemented.');
  }
}
