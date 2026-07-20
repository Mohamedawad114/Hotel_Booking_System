import { Module } from '@nestjs/common';
import { FacilityRepository, ProviderModule } from 'src/common';
import { FacilityService } from './facility.service';
import { FacilityTasks } from './facility.task';
import { FacilitiesController } from './facility.controller';

@Module({
  imports: [ProviderModule],
  controllers: [FacilitiesController],
  providers: [FacilityRepository, FacilityService, FacilityTasks],
  exports: [FacilityService],
})
export class FacilityModule {}
