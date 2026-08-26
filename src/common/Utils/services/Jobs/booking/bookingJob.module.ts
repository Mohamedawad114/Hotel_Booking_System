import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BookingJobProducer } from './bookingJob.producer';
import { BookingJobProcessor } from './bookingJob.processor';
import { BookingRepository } from 'src/common/repositories/prisma repositories';
import { BookingService } from 'src/modules/booking/booking.service';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from 'src/modules';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'booking' }),
    BullBoardModule.forFeature({
      name: 'booking',
      adapter: BullMQAdapter,
    }),
    EmailModule,
    NotificationModule,
  ],
  providers: [
    BookingJobProducer,
    BookingJobProcessor,
    BookingRepository,
    BookingService,
  ],
  exports: [BookingJobProducer],
})
export class BookingJobModule {}
