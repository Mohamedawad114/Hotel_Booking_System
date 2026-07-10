import { Module } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { DestinationRepository, ProviderModule } from 'src/common';
import { DestinationController } from './destination.controller';
import { DestinationTasks } from './destination.tasks';

@Module({
  imports: [ProviderModule],
  controllers: [DestinationController],
  providers: [DestinationService, DestinationRepository, DestinationTasks],
  exports: [DestinationService],
})
export class DestinationModule {}
