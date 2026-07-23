import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ReviewRepository extends BaseRepository<
  PrismaService['review'],
  Prisma.reviewCreateInput,
  Prisma.reviewUncheckedUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.review, prisma);
  }
}
