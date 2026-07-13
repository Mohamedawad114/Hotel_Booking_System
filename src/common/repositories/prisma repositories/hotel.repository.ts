import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { QueryDto } from 'src/modules/hotel/Dto/query.dto';
import { SearchHotelsDto } from 'src/modules/hotel/Dto/search.dto';
import { PinoLogger } from 'nestjs-pino';
import { IHotel, IHotelCursor } from 'src/common/interfaces';

@Injectable()
export class HotelRepository extends BaseRepository<
  PrismaService['hotel'],
  Prisma.hotelUncheckedCreateInput,
  Prisma.hotelUncheckedUpdateInput
> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    super(prisma.hotel, prisma);
  }

  async getHotels(
    filter?: SearchHotelsDto,
    query?: IHotelCursor,
  ) {
    try {
      const limit = query?.limit || 20;
      const cursorCreatedAt = query?.createdAt
        ? new Date(query.createdAt)
        : null;
      const whereConditions: Prisma.Sql[] = [];
      if (cursorCreatedAt) {
        whereConditions.push(Prisma.sql`"createdAt" > ${cursorCreatedAt}`);
      }
      if (filter?.hotelName) {
        whereConditions.push(
          Prisma.sql`name ILIKE ${'%' + filter.hotelName + '%'}`,
          Prisma.sql`description ILIKE ${'%' + filter.hotelName + '%'}`,
        );
      }
      if (filter?.destinationCode) {
        whereConditions.push(
          Prisma.sql`"destinationCode" = ${filter.destinationCode}`,
        );
      }
      if (filter?.rating) {
        whereConditions.push(Prisma.sql`rating = ${filter.rating}`);
      }
      const whereClause =
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
          : Prisma.empty;
      const hotels = await this.prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        description, 
        rating, 
        "destinationCode", 
        images[1] as "mainImage",
        "createdAt"
      FROM hotel
      ${whereClause}
      ORDER BY "createdAt" ASC, id ASC 
      LIMIT ${limit};
    `;
      return hotels ;
    } catch (error: any) {
      this.logger.error(`فشل جلب الفنادق: ${error.message}`);
      throw error;
    }
  }
}
