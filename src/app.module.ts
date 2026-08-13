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
  FacilityModule,
  HotelModule,
  FavoriteModule,
  ProfileModule,
  ReviewModule,
  RoomModule,
} from './modules';
import { ScheduleModule } from '@nestjs/schedule';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BookingModule } from './modules/booking/booking.module';
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
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
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
    CommonModule,
    AuthModule,
    ProfileModule,
    DestinationModule,
    FacilityModule,
    HotelModule,
    RoomModule,
    FavoriteModule,
    ReviewModule,
    BookingModule,
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
