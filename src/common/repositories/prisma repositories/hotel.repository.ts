import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  SearchHotelsDto,
  SortingHotelsDto,
} from 'src/modules/hotel/Dto/search.dto';
import { PinoLogger } from 'nestjs-pino';
import { IHotel, IHotelCursor } from 'src/common/interfaces';
import { order } from 'src/common/enums';

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
    sort?: SortingHotelsDto,
  ) {
    try {
      const limit = query?.limit;
      let sortField = 'createdAt';
      let sortDirection: order = order.desc;
      if (sort?.rating) {
        sortField = 'rating';
        sortDirection = sort.rating;
      } else if (sort?.ranking) {
        sortField = 'ranking';
        sortDirection = sort.ranking;
      }
      const cursorValue =
        sortField === 'createdAt' && query?.value
          ? new Date(query.value)
          : query?.value;
      const isAsc = sortDirection === order.asc;
      const orderSql = Prisma.raw(sortDirection);
      const compareOp = isAsc ? Prisma.raw('>') : Prisma.raw('<');
      const fieldSql = Prisma.raw(`"${sortField}"`);
      const whereConditions: Prisma.Sql[] = [];
      if (cursorValue !== undefined && query?.id) {
        whereConditions.push(
          Prisma.sql`
          (${fieldSql}, id)
          ${compareOp}
          (${cursorValue}, ${query.id})
        `,
        );
      }
      if (filter?.hotelName) {
        whereConditions.push(
          Prisma.sql`
          (
            name ILIKE ${'%' + filter.hotelName + '%'}
            OR description ILIKE ${'%' + filter.hotelName + '%'}
          )
        `,
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
      const hotels = await this.prisma.$queryRaw<IHotel[]>`
      SELECT
        id,
        name,
        description,
        rating,
        ranking,
        "destinationCode",
        images[1] as "mainImage",
        "createdAt"
      FROM hotel
      ${whereClause}
      ORDER BY ${fieldSql} ${orderSql}, id ${orderSql}
      LIMIT ${limit};
    `;
      return hotels;
    } catch (error) {
      throw error;
    }
  }
}
@Injectable()
export class HotelPhonesRepository extends BaseRepository<
  PrismaService['hotelPhone'],
  Prisma.hotelPhoneUncheckedCreateInput,
  Prisma.hotelPhoneUncheckedUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.hotelPhone, prisma);
  }
}
