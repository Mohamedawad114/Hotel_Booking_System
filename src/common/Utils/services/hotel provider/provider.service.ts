import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
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
  IHotel,
  IHotelPhone,
  IProviderService,
  IBookingRooms,
} from 'src/common/interfaces';
import { BookingInput } from 'src/modules/booking/dto/booking.dto';
import { SearchAvailabilityDto } from 'src/modules/booking/dto/checkAvailability.dto';
import axios, { AxiosError } from 'axios';
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
      if (dto.children && dto.children > 0) {
        if (!dto.childrenAges || dto.childrenAges.length !== dto.children) {
          throw new BadRequestException(
            `You must provide ages for all ${dto.children} children`,
          );
        }
      }
      const checkInDate = new Date(dto.checkIn).toISOString().split('T')[0];
      const checkOutDate = new Date(dto.checkOut).toISOString().split('T')[0];
      const occupancy: any = {
        rooms: 1,
        adults: Number(dto.adults),
        children: Number(dto.children) || 0,
      };
      if (dto.childrenAges?.length) {
        occupancy.paxes = dto.childrenAges.map((c: any) => ({
          type: 'CH',
          age: typeof c === 'number' ? c : c.age,
        }));
      }
      const payload = {
        stay: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
        },
        occupancies: [occupancy],
        hotels: {
          hotel: [Number(hotelCode)],
        },
      };
      const response$ = this.httpService.post('/hotel-api/1.0/hotels', payload);
      const response = await firstValueFrom(response$);
      return response.data?.hotels?.hotels;
    } catch (err: any) {
      if (err instanceof AxiosError) {
        console.dir(err.response?.data, { depth: null });
        throw new BadRequestException(
          err.response?.data || 'Hotelbeds Invalid Payload',
        );
      }
      throw err;
    }
  }

  async checkRates(rateKeys: string[]) {
    try {
      const payload = { rooms: rateKeys.map((rateKey) => ({ rateKey })) };
      const response = await firstValueFrom(
        this.httpService.post('/hotel-api/1.0/checkrates', payload),
      );
      const rooms = response.data?.hotel?.rooms || [];
      return rooms.map((room: any, i: number) => {
        const rate = room.rates?.[0];
        return {
          rateKey: rateKeys[i],
          newRateKey: rate?.rateKey ?? rateKeys[i],
          stillAvailable: !!rate,
          price: rate?.sellingRate ?? 0,
          priceChanged: rate?.sellingRate !== undefined,
        };
      });
    } catch (err: any) {
      if (err?.response?.status === 400) {
        return rateKeys.map((rateKey) => ({
          rateKey,
          newRateKey: rateKey,
          stillAvailable: false,
          price: 0,
          priceChanged: false,
        }));
      }
      this.logger.error(`Failed to check rates: ${err.message}`);
      throw err;
    }
  }
  async confirmBooking(
    hotelCode: number,
    clientReference: string,
    rooms: IBookingRooms[],
    params: BookingInput,
  ) {
    try {
      const payload = {
        holder: {
          name: params.holder.firstName ?? (params.holder as any).name,
          surname: params.holder.lastName ?? (params.holder as any).surname,
        },
        rooms: rooms.map((room, roomIndex) => ({
          rateKey: room.rateKey,
          paxes: room.guests.map((g) => ({
            roomId: roomIndex + 1,
            type: g.age && g.age < 18 ? 'CH' : 'AD',
            name: g.firstName,
            surname: g.lastName,
            ...(g.age !== undefined && { age: g.age }),
          })),
        })),
        clientReference: clientReference,
        paymentType: params.paymentType,
      };
      const response = await firstValueFrom(
        this.httpService.post('/hotel-api/1.0/bookings', payload),
      );
      const booking = response.data?.booking;
      const data = {
        reference: booking.reference,
        status: booking.status,
        paymentType: params.paymentType,
        totalPrice: booking.totalNet,
        checkIn: new Date(booking.hotel.checkIn),
        checkOut: new Date(booking.hotel.checkOut),
        currency: booking.currency || booking.hotel?.currency || 'EGP',
        rooms: (booking.hotel.rooms || []).map((r: any, i: number) => {
          const originalRoom = rooms[i];
          const roomPrice = r.rates && r.rates.length > 0 ? r.rates[0].net : 0;
          return {
            code: r.code,
            hotelId: hotelCode,
            rateKey: originalRoom?.rateKey,
            price: Number(roomPrice),
            adultsCount: originalRoom?.adultsCount ?? 0,
            childrenCount: originalRoom?.childrenCount ?? 0,
            guests: originalRoom?.guests || [],
          };
        }),
        holder: params.holder,
      };
      return data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          error.response?.data || 'Hotelbeds Booking Failed',
        );
      }
      if (axios.isAxiosError(error)) {
        this.logger.error(
          'Hotelbeds Error Detail:',
          JSON.stringify(error.response?.data, null, 2),
        );
        throw new BadRequestException(
          error.response?.data || 'Hotelbeds Booking Failed',
        );
      }
      throw error;
    }
  }

  async CancelBooking(providerReference: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `/hotel-api/1.0/bookings/${providerReference}`,
          {
            params: {
              cancellationFlag: 'CANCELLATION',
            },
          },
        ),
      );
      const data = response.data;
      return {
        success: true,
        cancellationReference: data.booking?.cancellationReference,
        refundAmount: Number(data.cancellationAmount?.refund ?? 0),
        cancellationFee: Number(data.booking?.cancellationFees ?? 0),
      };
    } catch (error: any) {
      this.logger.error({
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw error;
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
