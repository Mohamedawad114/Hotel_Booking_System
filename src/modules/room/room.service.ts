import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  decoderCursor,
  encodedCursor,
  redis,
  redisKeys,
  RoomFacilityRepository,
  RoomRepository,
  TTL,
} from 'src/common';
import { searchRoomsDto } from './Dto/searchRooms.dto';

@Injectable()
export class RoomServices {
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly roomFacilityRepo: RoomFacilityRepository,
  ) {}
  async getHotelRooms(
    hotelId: number,
    filter: searchRoomsDto,
    cursor?: string,
    limit?: number,
  ) {
    if (!hotelId) throw new BadRequestException('hotelId is required');
    const cursorDecoded = decoderCursor(cursor);
    const cached = await redis.get(
      redisKeys.hotelRooms(hotelId, cursor, limit),
    );
    if (cached) return JSON.parse(cached);
    const rooms = await this.roomRepo.getHotelRooms(hotelId, filter, {
      limit: limit || 20,
      value: cursorDecoded?.value,
      id: cursorDecoded?.id,
    });
    if (!rooms || !rooms.length)
      throw new NotFoundException('hotel no have rooms');
    const lastItem = rooms[rooms.length - 1];
    const nextCursor = encodedCursor({
      value: lastItem.createdAt!,
      sortField: 'createdAt',
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
  async getRoomFacilities(roomCode: string, hotelId: number) {
    if (!roomCode && !hotelId)
      throw new BadRequestException('room id is required');
    const cached = await redis.get(redisKeys.roomFacilities(roomCode, hotelId));
    if (cached) return JSON.parse(cached);
    const room = await this.roomRepo.findUnique(
      { code: roomCode, hotelId },
      {
        select: { id: true, code: true },
      },
    );
    if (!room) throw new NotFoundException('room not found');
    const facilities = await this.roomFacilityRepo.findMany({
      code: room.code,
    });
    if (!facilities.length) return { message: 'no facilities for this room' };
    const res = {
      message: 'room facilities',
      data: facilities,
    };
    await redis.setex(
      redisKeys.roomFacilities(roomCode, hotelId),
      TTL.roomFacilities,
      JSON.stringify(res),
    );
    return res;
  }
}
