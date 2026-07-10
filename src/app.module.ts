import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { CommonModule, PrismaModule, ProviderModule, redis } from './common';
import { LoggerModule } from 'nestjs-pino';
import { GlobalErrFilter } from './common/guards';
import {
  LoggingInterceptor,
  ResponseInterceptor,
  TimeoutInterceptor,
} from './common/interceptors';
import {
  AuthModule,
  DestinationModule,
  HotelModule,
  ProfileModule,
} from './modules';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/dev.env'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL as string, {
      serverSelectionTimeoutMS: 3000,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 4000,
      },
    ]),
    BullModule.forRoot({ connection: redis }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      },
    }),
    PrismaModule,
    ProviderModule,
    CommonModule,
    AuthModule,
    ProfileModule,
    DestinationModule,
    HotelModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_FILTER',
      useClass: GlobalErrFilter,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: TimeoutInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
    {
      provide: 'APP_PIPE',
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
