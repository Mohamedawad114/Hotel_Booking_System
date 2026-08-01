import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { PinoLogger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';
import {
  IDestination,
  IFacility,
  IHotelFacilities,
  IRoom,
  IRoomFacilities,
} from 'src/common/interfaces';
import { IHotel, IHotelPhone, IProviderService } from 'src/common/interfaces';
import { SearchAvailabilityDto } from 'src/modules/room/Dto/checkAvailability.dto';
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
  async getFacilities(): Promise<IFacility[]> {
    try {
      const facilities: IFacility[] = [];
      const response = await firstValueFrom(
        this.httpService.get('/hotel-content-api/1.0/types/facilities', {
          params: { fields: 'all', language: 'ENG', from: 1, to: 1000 },
        }),
      );
      const batch = response.data?.facilities || [];
      facilities.push(
        ...batch.map((f) => ({
          code: f.code,
          name: f.description.content || '',
          groupCode: f.facilityGroupCode,
        })),
      );
      return facilities;
    } catch (err: any) {
      this.logger.error(`Failed to fetch facilities: ${err.message}`);
      throw err;
    }
  }
  async getData(countryCode: string): Promise<{
    allHotels: IHotel[];
    allHotelFacilities: IHotelFacilities[];
    allRooms: IRoom[];
    allRoomFacilities: IRoomFacilities[];
    allHotelPhones: IHotelPhone[];
  }> {
    try {
      const allHotels: IHotel[] = [];
      const allHotelFacilities: IHotelFacilities[] = [];
      const allRooms: IRoom[] = [];
      const allHotelPhones: IHotelPhone[] = [];
      const allRoomFacilities: IRoomFacilities[] = [];
      let from = 1;
      let hasMore = true;
      while (hasMore) {
        const response$ = this.httpService.get(
          '/hotel-content-api/1.0/hotels',
          {
            params: {
              countryCode,
              fields: 'all',
              language: 'ENG',
              from,
              to: from + 999,
            },
          },
        );
        const response = await firstValueFrom(response$);
        const batch = response.data?.hotels || [];
        for (const hotel of batch) {
          const { rooms, roomFacilities } = this.extractRoomData(
            hotel.code,
            hotel.rooms,
          );
          allRooms.push(...rooms);
          allRoomFacilities.push(...roomFacilities);
          const hotelFacilities = this.extractHotelFacilities(
            hotel.code,
            hotel?.facilities,
          );
          allHotelFacilities.push(...hotelFacilities);
          if (hotel.phones) {
            for (const p of hotel.phones) {
              const num = p.phoneNumber;
              if (num) {
                allHotelPhones.push({
                  hotelId: hotel.code,
                  phoneNumber: num,
                  phoneType: p.phoneType || 'PHONEHOTEL',
                });
              }
            }
          }
          allHotels.push({
            id: hotel.code ?? 0,
            code: hotel.code ?? 0,
            name: hotel.name?.content || hotel.name?.text || hotel.name || '',
            email: hotel.email,
            description:
              hotel.description?.content ||
              hotel.description?.text ||
              hotel.description ||
              '',
            address:
              hotel.address?.content ||
              hotel.address?.text ||
              hotel.address ||
              '',
            destinationCode: hotel.destinationCode || hotel.destination || '',
            images:
              hotel.images
                ?.map((img: any) =>
                  img?.path
                    ? `https://photos.hotelbeds.com/giata/${img.path}`
                    : img?.url || '',
                )
                .filter(Boolean) || [],
            web: hotel.web || hotel.website || '',
            ranking: Number(hotel.ranking) || 0,
            rating:
              Number(
                `${hotel.S2C ?? hotel.categoryCode}`.replace(/[^0-9]/g, ''),
              ) || 0,
            latitude:
              hotel.coordinates?.latitude ||
              hotel.geoCode?.latitude ||
              undefined,
            longitude:
              hotel.coordinates?.longitude ||
              hotel.geoCode?.longitude ||
              undefined,
            city:
              hotel.city?.content ||
              hotel.city?.text ||
              hotel.city ||
              hotel.address?.city ||
              '',
            countryCode: hotel.countryCode || countryCode || '',
          });
        }
        batch.length < 1000 ? (hasMore = false) : (from += 1000);
      }
      this.logger.info(
        `Fetched ${allHotels.length} hotels, ${allRooms.length} rooms successfully.`,
      );
      return {
        allHotels,
        allHotelFacilities,
        allRooms,
        allRoomFacilities,
        allHotelPhones,
      };
    } catch (error: any) {
      this.logger.error(`فشل جلب الـ hotels: ${error.message}`);
      throw error;
    }
  }

  async checkAvailability(hotelCode: number, dto: SearchAvailabilityDto) {
    try {
      const payload = {
        stay: {
          checkIn: dto.checkIn,
          checkOut: dto.checkOut,
        },
        occupancies: [
          {
            rooms: 1,
            adults: dto.adults,
            children: dto.children,
          },
        ],
        hotels: {
          hotel: hotelCode,
        },
      };
      const response$ = this.httpService.post(
        '/hotel-content-api/1.0/hotels',
        payload,
      );
      const response = await firstValueFrom(response$);
      const availabilityData = response.data?.hotels?.hotels;
      return availabilityData;
    } catch (err) {
      this.logger.error("can't check availability", err);
      throw err;
    }
  }
  private extractRoomData(hotelCode: number, apiRooms: any[]) {
    const rooms: IRoom[] = [];
    const roomFacilities: any[] = [];
    if (!apiRooms) return { rooms, roomFacilities };
    for (const room of apiRooms) {
      rooms.push({
        hotelId: hotelCode,
        code: room.roomCode,
        description: room.description,
        roomType: room.roomType,
        isParentRoom: room.isParentRoom,
        roomCategory: room.characteristicCode,
        maxAdults: room.maxAdults || 2,
        maxChildren: room.maxChildren || 0,
      });
      if (room.roomFacilities) {
        for (const rf of room.roomFacilities) {
          roomFacilities.push({
            roomCode: room.roomCode,
            hotelId: hotelCode,
            facilityCode: rf.facilityCode,
            facilityGroupCode: rf.facilityGroupCode,
            indFee: rf.indFee ?? null,
            indLogic: rf.indLogic ?? null,
            voucher: rf.voucher ?? null,
            number: rf.number ?? null,
          });
        }
      }
    }

    return { rooms, roomFacilities };
  }
  private extractHotelFacilities(hotelCode: number, apiFacilities: any[]) {
    if (!apiFacilities) return [];
    return apiFacilities.map((fac) => ({
      hotelId: hotelCode,
      facilityCode: fac.facilityCode,
      facilityGroupCode: fac.facilityGroupCode,
      order: fac.order || null,
      indFee: fac.indFee ?? null,
      indYesOrNo: fac.indYesOrNo ?? null,
      indLogic: fac.indLogic ?? null,
      voucher: fac.voucher ?? null,
      timeFrom: fac.timeFrom || null,
      timeTo: fac.timeTo || null,
      number: fac.number ?? null,
    }));
  }
}
