import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CancellationProducer } from './cancellation.job.producer';
import { CancellationProcessor } from './cancellation.job.processor';
import { BookingRepository } from 'src/common/repositories/prisma repositories';
import { BookingService } from 'src/modules/booking/booking.service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'cancellation' }),
    BullBoardModule.forFeature({
      name: 'cancellation',
      adapter: BullMQAdapter,
    }),
    CqrsModule,
  ],
  providers: [
    CancellationProcessor,
    CancellationProducer,
    BookingRepository,
    BookingService,
  ],
  exports: [CancellationProducer],
})
export class CancellationModule {}
