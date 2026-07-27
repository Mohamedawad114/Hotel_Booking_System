import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingRepository extends BaseRepository<
  PrismaService['booking'],
  Prisma.bookingCreateInput,
  Prisma.roomUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.booking, prisma);
  }
}
