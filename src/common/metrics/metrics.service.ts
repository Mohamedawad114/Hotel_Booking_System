import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { names } from './metricsNames';
import { Gauge } from 'prom-client';

@Injectable()
export class MetricsServices {
  constructor(
    @InjectMetric(names.gauge)
    private readonly WsConnectionGauge: Gauge<string>,
  ) {}

  onWsConnection() {
    return this.WsConnectionGauge.inc();
  }
  onWsDisconnection() {
    return this.WsConnectionGauge.dec();
  }
}
