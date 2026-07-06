import { Module } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { DestinationRepository } from 'src/common';
import { DestinationController } from './destination.controller';

@Module({
  imports: [],
  controllers: [DestinationController],
  providers: [DestinationService, DestinationRepository],
  exports: [DestinationService],
})
export class DestinationModule {}
