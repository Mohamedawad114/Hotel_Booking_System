import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentRepository extends BaseRepository<
  PrismaService['payment'],
  Prisma.paymentCreateInput,
  Prisma.paymentUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.payment, prisma);
  }
}
