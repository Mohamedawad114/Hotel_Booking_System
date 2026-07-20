import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class FacilityRepository extends BaseRepository<
  PrismaService['facility'],
  Prisma.facilityCreateInput,
  Prisma.facilityUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.facility, prisma);
  }
}
@Injectable()
export class RoomFacilityRepository extends BaseRepository<
  PrismaService['roomFacilities'],
  Prisma.roomFacilitiesUncheckedCreateInput,
  Prisma.roomFacilitiesUncheckedUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.roomFacilities, prisma);
  }
}
@Injectable()
export class HotelFacilityRepository extends BaseRepository<
  PrismaService['hotelFacilities'],
  Prisma.hotelFacilitiesUncheckedCreateInput,
  Prisma.hotelFacilitiesUncheckedUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.hotelFacilities, prisma);
  }
}
