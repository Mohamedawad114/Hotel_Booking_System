import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BookingJobProducer } from './bookingJob.producer';
import { ProviderModule } from '../../hotel provider/provider.module';
import { BookingJobProcessor } from './bookingJob.processor';
import { BookingRepository } from 'src/common/repositories/prisma repositories';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'booking' }),
    BullBoardModule.forFeature({
      name: 'booking',
      adapter: BullMQAdapter,
    }),
  ],
  providers: [BookingJobProducer, BookingJobProcessor, BookingRepository],
  exports: [BookingJobProducer],
})
export class BookingJobModule {}
