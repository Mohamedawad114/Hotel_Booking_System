import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository extends BaseRepository<
  PrismaService['user'],
  Prisma.userCreateInput,
  Prisma.userUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.user, prisma);
  }
  async findByEmail(email: string, options?: any) {
    return await this.model.findUnique({ where: { email }, ...options });
  }
}
