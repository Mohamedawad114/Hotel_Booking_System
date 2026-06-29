import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import {
  CryptoService,
  EmailModule,
  HashingService,
  TwoFAService,
} from 'src/common';

@Module({
  providers: [ProfileService, CryptoService, HashingService, TwoFAService],
  controllers: [ProfileController],
  imports: [EmailModule],
})
export class ProfileModule {}
