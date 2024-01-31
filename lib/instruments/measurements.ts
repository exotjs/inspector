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
  MeasurementsInstrumentInit,
  Query,
  TrackResponse,
} from '../types.js';

export class MeasurementsInstrument extends BaseInstrument {
  #measurements: Measurements;

  dashboards: Dashboard[];

  sensors: SensorBase[] = [];

  constructor(store: Store, init: MeasurementsInstrumentInit = {}) {
    const { dashboards = [], disabled = false } = init;
    super('measurements', store, disabled);
    this.dashboards = [...Inspector.defaultDashboards(), ...dashboards];
    this.#measurements = new Measurements(
      {
        measurements: this.#getMeasurementsFromDashboards(this.dashboards),
      },
      store,
    );
  }

  trackResponse(response: TrackResponse) {
    const status = String(response.status).slice(0, 1) + 'xx';
    this.#measurements.push({
      'response:latency': [response.duration],
      [`response:${status}`]: [1],
    });
  }

  activate() {
    for (let [key, config] of this.#measurements.measurements) {
      if (config.sensor) {
        const cls = this.#getSensor(config.sensor);
        const sensor = new cls(key, config.interval);
        sensor.on('sample', (value) => {
          this.#measurements.push({
            [key]: value,
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

  async query(store: Store, query: Query & { keys: string[] }) {
    const result = await this.#measurements.export({
      ...query,
    });
    return {
      entries: result.map(
        (item) => [Date.now(), '', JSON.stringify(item)] as StoreEntry,
      ),
      hasMore: false,
    };
  }

  subscribe(
    fn: (time: number, label: string, value: any) => void,
    options: { interval?: number; keys?: string[]; startTime?: number },
  ): () => void {
    let time = options.startTime || Date.now();
    const tick = () => {
      const now = Date.now();
      this.#measurements
        .export({
          keys: options.keys,
          startTime: time,
        })
        .then((result) => {
          fn(time, '', JSON.stringify(result));
        })
        .catch(() => {
          // TODO:
        })
        .finally(() => {
          time = now;
        });
    };
    const interval = setInterval(tick, options.interval || 5000);
    tick();
    return () => {
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
            type: measurement.type || 'number',
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
