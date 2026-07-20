import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { searchRoomsDto } from 'src/modules/hotel/Dto/searchRooms.dto';
import { IHotelCursor, IRoom } from 'src/common/interfaces';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RoomRepository extends BaseRepository<
  PrismaService['room'],
  Prisma.roomUncheckedCreateInput,
  Prisma.roomUncheckedUpdateInput
> {
  constructor(protected readonly prisma: PrismaService,private readonly logger: PinoLogger) {
    super(prisma.room, prisma);
  }
  async getHotelRooms(
    hotelId: number,
    filter?: searchRoomsDto,
    query?: IHotelCursor,
  ): Promise<IRoom[]> {
    try {
      const limit = query?.limit || 20;
      const cursorCreatedAt = query?.createdAt
        ? new Date(query.createdAt)
        : null;
      const whereConditions: Prisma.Sql[] = [];
      whereConditions.push(Prisma.sql`"hotelId" = ${hotelId}`);
      if (cursorCreatedAt && query?.id) {
        whereConditions.push(
          Prisma.sql`("createdAt", id) > (${cursorCreatedAt}, ${query.id})`,
        );
      } else if (cursorCreatedAt) {
        whereConditions.push(Prisma.sql`"createdAt" > ${cursorCreatedAt}`);
      }
      if (filter?.adults) {
        whereConditions.push(Prisma.sql`"maxAdults" >= ${filter.adults}`);
      }
      if (filter?.children) {
        whereConditions.push(Prisma.sql`"maxChildren" >= ${filter.children}`);
      }
      const whereClause =
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
          : Prisma.empty;
      const rooms = await this.prisma.$queryRaw<IRoom[]>`
      SELECT 
        id, 
        code, 
        "maxAdults", 
        "maxChildren",
        "roomType", 
        "roomCategory", 
        "createdAt"
      FROM "Room"
      ${whereClause}
      ORDER BY "createdAt" ASC, id ASC 
      LIMIT ${limit};
    `;

      return rooms;
    } catch (error: any) {
      this.logger.error(`فشل جلب غرف الفندق ${hotelId}: ${error.message}`);
      throw error;
    }
  }
}
