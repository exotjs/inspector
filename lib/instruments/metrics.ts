import {
  MeasurementConfig,
  Store,
  StoreEntry,
} from '@exotjs/measurements/types';
import { Measurements } from '@exotjs/measurements';
import { BaseInstrument, SensorBase } from '../base.js';
import { MemoryRssSensor } from '../sensors/memory-rss.js';
import { MemoryHeapSensor } from '../sensors/memory-heap.js';
import { EventLoopDelaySensor } from '../sensors/event-loop-delay.js';
import { CpuSensor } from '../sensors/cpu.js';
import { Inspector } from '../inspector.js';
import type {
  Dashboard,
  MetricsInstrumentInit,
  Query,
  TrackResponse,
} from '../types.js';

export class MetricsInstrument extends BaseInstrument {
  #measurements: Measurements;

  dashboards: Dashboard[];

  sensors: SensorBase[] = [];

  constructor(store: Store, init: MetricsInstrumentInit = {}) {
    const { dashboards = [], disabled = false } = init;
    super('metrics', store, disabled);
    this.dashboards = [...Inspector.defaultDashboards(), ...dashboards];
    this.#measurements = new Measurements({
      measurements: this.#getMeasurementsFromDashboards(this.dashboards),
      store,
    });
  }

  trackResponse(response: TrackResponse) {
    const status = String(response.status).slice(0, 1) + 'xx';
    this.#measurements.push({
      'response:latency': [
        {
          values: [response.duration],
        },
      ],
      [`response:${status}`]: [
        {
          values: [1],
        },
      ],
    });
  }

  activate() {
    for (let [key, config] of this.#measurements.measurements) {
      if (config.sensor) {
        const cls = this.#getSensor(config.sensor);
        const sensor = new cls(key, config.interval);
        sensor.on('sample', (value) => {
          this.#measurements.push({
            [key]: [
              {
                values: [value],
              },
            ],
          });
        });
        this.sensors.push(sensor);
      }
    }
    return super.activate();
  }

  deactivate() {
    for (let sensor of this.sensors) {
      sensor.destroy();
    }
    this.sensors = [];
    return super.deactivate();
  }

  async query(query: Query & { keys: string[] }) {
    const result = await this.#measurements.export({
      ...query,
    });
    return {
      entries: result.map(
        (item) => [Date.now(), '', JSON.stringify(item)] as StoreEntry
      ),
      hasMore: false,
    };
  }

  subscribe(
    fn: (time: number, label: string, value: any) => void,
    options: { interval?: number; keys?: string[]; startTime?: number }
  ): () => void {
    let time = options.startTime || Date.now();
    let subscribed = true;
    let running = false;
    const tick = () => {
      if (running) {
        return;
      }
      running = true;
      const now = Date.now();
      this.#measurements
        .export({
          keys: options.keys,
          startTime: time,
        })
        .then((result) => {
          if (subscribed) {
            fn(time, '', JSON.stringify(result));
          }
        })
        .catch(() => {
          // TODO:
        })
        .finally(() => {
          time = now;
          running = false;
        });
    };
    const interval = setInterval(tick, options.interval || 5000);
    tick();
    return () => {
      subscribed = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }

  #getMeasurementsFromDashboards(dashboards: Dashboard[]): MeasurementConfig[] {
    return dashboards.reduce((acc, dashboard) => {
      for (let measurement of dashboard.measurements) {
        if (!acc.find(({ key }) => key === measurement.key)) {
          acc.push({
            interval: measurement.interval || 10000,
            key: measurement.key,
            type: measurement.type || 'aggregate',
            sensor: measurement.sensor,
          });
        }
      }
      return acc;
    }, [] as MeasurementConfig[]);
  }

  #getSensor(type: string) {
    switch (type) {
      case 'cpu':
        return CpuSensor;
      case 'event-loop-delay':
        return EventLoopDelaySensor;
      case 'memory-heap':
        return MemoryHeapSensor;
      case 'memory-rss':
        return MemoryRssSensor;
      default:
        throw new Error('Unknown sensor type.');
    }
  }
}
