import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  CryptoService,
  EmailModule,
  HashingService,
  TwoFAService,
  UserRepository,
} from 'src/common';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    CryptoService,
    HashingService,
    TwoFAService,
    UserRepository,
  ],
})
export class AuthModule {}
