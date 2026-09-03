import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CryptoService } from 'src/common/Utils/crypto/crypto.service';
import { EmailModule } from 'src/common/Utils/services/Jobs/email/email.module';
import { HashingService } from 'src/common/Utils/Hashing/hash.service';
import { TwoFAService } from 'src/common/Utils/services/2FA.service';
import { UserRepository } from 'src/common';


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
