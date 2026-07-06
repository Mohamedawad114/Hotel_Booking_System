import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { HashingService } from '../Utils';

@Global()
@Module({
  providers: [PrismaService,HashingService],
  exports: [PrismaService],
})
export class PrismaModule {}
