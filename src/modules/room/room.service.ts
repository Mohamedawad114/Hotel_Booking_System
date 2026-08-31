import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  decoderCursor,
  encodedCursor,
  HotelRepository,
  redis,
  redisKeys,
  RoomFacilityRepository,
  RoomRepository,
  TTL,
} from 'src/common';
import { SearchRoomsDto } from './Dto/searchRooms.dto';

@Injectable()
export class RoomServices {
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly roomFacilityRepo: RoomFacilityRepository,
    private readonly hotelRepo: HotelRepository,
  ) {}
  async getHotelRooms(hotelId: number, filter: SearchRoomsDto) {
    if (!hotelId) throw new BadRequestException('hotelId is required');
    const hotel = await this.hotelRepo.findById(hotelId, {
      select: { id: true },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    const cursorDecoded = decoderCursor(filter.cursor);
    const cached = await redis.get(
      redisKeys.hotelRooms(hotelId, filter.cursor, filter.limit),
    );
    if (cached) return JSON.parse(cached);
    const rooms = await this.roomRepo.getHotelRooms(hotelId, filter, {
      limit: filter.limit || 20,
      value: cursorDecoded?.value,
      id: cursorDecoded?.id,
    });
    if (!rooms.length || (!rooms.length && filter.cursor))
      throw new NotFoundException('hotel no have more rooms');
    const lastItem = rooms[rooms.length - 1];
    const nextCursor = encodedCursor({
      value: lastItem.createdAt!,
      sortedField: 'createdAt',
      id: lastItem.id!,
    });
    const res = {
      message: 'hotel rooms',
      data: rooms,
      meta: { nextCursor },
    };
    await redis.setex(
      redisKeys.hotelRooms(hotelId),
      TTL.hotelRooms,
      JSON.stringify(res),
    );
    return res;
  }
  async getRoomFacilities(roomId: number) {
    if (!roomId) throw new BadRequestException('room id is required');
    const cached = await redis.get(redisKeys.roomFacilities(roomId));
    if (cached) return JSON.parse(cached);
    const room = await this.roomRepo.findUnique(
      { id: roomId },
      {
        select: { hotelId: true, code: true },
      },
    );
    if (!room) throw new NotFoundException('room not found');
    const facilities = await this.roomFacilityRepo.findMany(
      {
        roomCode: room.code,
        hotelId: room.hotelId,
      },
      { select: { id: true, facility: { select: { name: true, id: true } } } },
    );
    if (!facilities.length) return { message: 'no facilities for this room' };
    const res = {
      message: 'room facilities',
      data: facilities,
    };
    await redis.setex(
      redisKeys.roomFacilities(roomId),
      TTL.roomFacilities,
      JSON.stringify(res),
    );
    return res;
  }
}
