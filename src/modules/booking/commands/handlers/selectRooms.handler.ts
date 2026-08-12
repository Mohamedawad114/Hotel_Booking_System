import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SelectRoomsCommand } from '../selectRooms.command';
import { BadRequestException, Injectable } from '@nestjs/common';
import { redis, redisKeys, TTL } from 'src/common';
@Injectable()
@CommandHandler(SelectRoomsCommand)
export class SelectRoomsHandler implements ICommandHandler<SelectRoomsCommand> {
  async execute(command: SelectRoomsCommand) {
    const { hotelId, data, userId } = command;
    if (!data.rooms.length) {
      throw new BadRequestException('at least one room must be selected');
    }
    const key = redisKeys.selectionRooms(hotelId, userId);
    await redis.setex(key, TTL.selectionRooms, JSON.stringify(data));
    return {
      message: `${data.rooms.length} room(s) selected`,
      roomSelections: data.rooms,
    };
  }
}
