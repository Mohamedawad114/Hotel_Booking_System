import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  CryptoService,
  EmailModule,
  HashingService,
  TwoFAService,
} from 'src/common';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [AuthService, CryptoService, HashingService, TwoFAService],
})
export class AuthModule {}
