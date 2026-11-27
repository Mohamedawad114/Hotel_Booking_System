import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { names } from './metricsNames';
import { MetricsServices } from './metrics.service';
import { LoggingInterceptor } from '../interceptors';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    MetricsServices,
    makeCounterProvider({
      name: names.counter,
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    }),
    makeCounterProvider({
      name: names.booking_counter,
      help: 'Total number of bookings',
      labelNames: ['booking_status'],
    }),
    makeHistogramProvider({
      name: names.histogram,
      help: 'Histogram of HTTP request durations',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.05, 0.1, 0.5, 1, 2, 5],
    }),
    makeGaugeProvider({
      name: names.gauge,
      help: ' Gauge for WebSocket connections',
    }),
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
  exports: [MetricsServices],
})
export class MetricsModule {}
