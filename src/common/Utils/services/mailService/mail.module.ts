import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailServices } from './mail.service';
import { HashingService } from '../../Hashing/hash.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailServices, HashingService],
  exports: [EmailServices],
})
export class MailModule {}
