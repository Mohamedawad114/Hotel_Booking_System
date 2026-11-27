import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { names } from './metricsNames';
import { Counter, Gauge } from 'prom-client';

@Injectable()
export class MetricsServices {
  constructor(
    @InjectMetric(names.gauge)
    private readonly WsConnectionGauge: Gauge<string>,
    @InjectMetric(names.booking_counter)
    private readonly bookingCounter: Counter<string>,
  ) {}

  onBookingCreated(status: string): void {
    return this.bookingCounter.inc({ booking_status: status });
  }
  onWsConnection(): void {
    return this.WsConnectionGauge.inc();
  }
  onWsDisconnection(): void {
    return this.WsConnectionGauge.dec();
  }
}
