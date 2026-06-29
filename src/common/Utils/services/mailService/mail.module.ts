import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailServices } from './mail.service';
import { HashingService } from '../../Hashing/hash.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRoot({
      transport: {
        port: 465,
        service: process.env.MAIL_SERVICE as string,
        secure:true,
        auth: {
          pass: process.env.APP_PASSWORD as string,
          user: process.env.APP_GMAIL as string,
        },
      },
    }),
  ],
  providers: [EmailServices, HashingService],
  exports: [EmailServices],
})
export class MailModule {}
