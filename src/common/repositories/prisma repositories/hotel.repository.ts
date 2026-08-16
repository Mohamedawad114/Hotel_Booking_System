import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SearchArgs } from 'src/modules/hotel/Dto/search.dto';
import { PinoLogger } from 'nestjs-pino';
import { IHotel } from 'src/common/interfaces';
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
    query?: SearchArgs,
    options?: {
      value?: string | Date | number;
      id?: number;
      sortedField?: string;
    },
  ) {
    const { value, id, sortedField } = options || {};
    try {
      const limit = query?.limit || 20;
      let sortField = sortedField || 'createdAt';
      let sortDirection: order = order.desc;

      if (query?.rating) {
        sortField = 'rating';
        sortDirection = query.rating;
      } else if (query?.ranking) {
        sortField = 'ranking';
        sortDirection = query.ranking;
      }

      const isAsc = sortDirection === order.asc;
      const fieldSql = Prisma.raw(`"${sortField}"`);
      const whereConditions: Prisma.Sql[] = [];

      if (
        id !== undefined &&
        id !== null &&
        value !== undefined &&
        value !== null
      ) {
        if (sortField === 'createdAt') {
          const cursorValue = String(value);
          if (isAsc) {
            whereConditions.push(
              Prisma.sql`(${fieldSql} = ${cursorValue}::timestamp AND id > ${id}) OR (${fieldSql} > ${cursorValue}::timestamp)`,
            );
          } else {
            whereConditions.push(
              Prisma.sql`(${fieldSql} = ${cursorValue}::timestamp AND id < ${id}) OR (${fieldSql} < ${cursorValue}::timestamp)`,
            );
          }
        } else {
          const cursorValue = Number(value);
          if (isAsc) {
            whereConditions.push(
              Prisma.sql`(${fieldSql} = ${cursorValue} AND id > ${id}) OR (${fieldSql} > ${cursorValue})`,
            );
          } else {
            whereConditions.push(
              Prisma.sql`(${fieldSql} = ${cursorValue} AND id < ${id}) OR (${fieldSql} < ${cursorValue})`,
            );
          }
        }
      }
      if (query?.hotelName) {
        whereConditions.push(
          Prisma.sql`(name ILIKE ${'%' + query.hotelName + '%'} OR description ILIKE ${'%' + query.hotelName + '%'})`,
        );
      }
      if (query?.destinationCode) {
        whereConditions.push(
          Prisma.sql`"destinationCode" = ${query.destinationCode}`,
        );
      }
      if (query?.stars) {
        whereConditions.push(Prisma.sql`rating = ${query.stars}`);
      }
      const whereClause =
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
          : Prisma.empty;
      const hotels = await this.prisma.$queryRaw<IHotel[]>`
      SELECT
        id, code, name, description, address, email,
        images, web, ranking, rating, latitude, longitude,
        "destinationCode", city, "countryCode", "createdAt"
      FROM hotel 
      ${whereClause}
      ORDER BY ${fieldSql} ${Prisma.raw(sortDirection)}, id ${Prisma.raw(sortDirection)}
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
  async findByHotelIds(hotelIds: number[]) {
    return this.prisma.hotelPhone.findMany({
      where: { hotelId: { in: hotelIds } },
    });
  }
}
