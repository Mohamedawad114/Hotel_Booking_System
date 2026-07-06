import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class DestinationRepository extends BaseRepository<
  PrismaService['destination'],
  Prisma.destinationCreateInput,
  Prisma.destinationUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.destination, prisma);
  }
}
