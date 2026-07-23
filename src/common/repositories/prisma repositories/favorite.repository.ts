import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class FavoriteRepository extends BaseRepository<
  PrismaService['favorite'],
  Prisma.favoriteCreateInput,
  Prisma.favoriteCreateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.favorite, prisma);
  }
}
