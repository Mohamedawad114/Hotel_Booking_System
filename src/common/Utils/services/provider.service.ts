import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { PinoLogger } from 'nestjs-pino';
import { IDestination } from 'src/common/interfaces';
import { IHotel } from 'src/common/interfaces/hotel.interface';
import { IProviderService } from 'src/common/interfaces/provider.interface';

@Injectable()
export class HotelbedsProvider implements IProviderService {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly secret: string;

  constructor(private readonly config: ConfigService, private readonly logger: PinoLogger;) {
    this.apiKey = this.config.getOrThrow<string>('APIKEY');
    this.secret = this.config.getOrThrow<string>('APISECRET');

    this.client = axios.create({
      baseURL: this.config.get(
        'HOTELBEDS_BASE_URL',
       this.config.getOrThrow<string>('PROVIDERURL')
      ),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.client.interceptors.request.use((req) => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = crypto
        .createHash('sha256')
        .update(this.apiKey + this.secret + timestamp)
        .digest('hex');

      req.headers['Api-key'] = this.apiKey;
      req.headers['X-Signature'] = signature;
      return req;
    });
  }

  async getDestinations(countryCode: string): Promise<IDestination[]> {
    try {
      const response = await this.client.get(
        '/hotel-content-api/1.0/types/destinations',
        {
          params: {
            countryCode,
            fields: 'all',
            language: 'ENG',
            from: 1,
            to: 1000,
          },
        },
      );

      return response.data.destinations.map((dest: any) => ({
        code: dest.code,
        name: dest.name?.content ?? dest.code,
        countryCode: dest.countryCode,
      }));
    } catch (error:any) {
      this.logger.error(`فشل جلب الـ destinations: ${error.message}`);
      throw error;
    }
    }
    async getHotels(filter: any): Promise<IHotel[]> {
           const response = await this.client.get(
        '/hotel-content-api/1.0/types/',
        {
          params: {
            filter,
            fields: 'all',
            language: 'ENG',
            from: 1,
            to: 1000,
          },
        },
      );

      return response.data.destinations.map((dest: any) => ({
        code: dest.code,
        name: dest.name?.content ?? dest.code,
        countryCode: dest.countryCode,
      }));
    } catch (error:any) {
      this.logger.error(`فشل جلب الـ destinations: ${error.message}`);
      throw error;
    }
    async getHotelDetails(hotelId: string): Promise<IHotel> { }
    }

