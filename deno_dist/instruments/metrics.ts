import { Store, StoreEntry } from 'npm:@exotjs/measurements@0.1.5/types';
import { Measurements } from 'npm:@exotjs/measurements@0.1.5';
import { BaseInstrument } from './base.ts';
import { SensorBase } from '../sensors/base.ts';
import { MemoryRssSensor } from '../sensors/memory-rss.ts';
import { MemoryHeapSensor } from '../sensors/memory-heap.ts';
import { EventLoopDelaySensor } from '../sensors/event-loop-delay.ts';
import { CpuSensor } from '../sensors/cpu.ts';
import { Inspector } from '../inspector.ts';
import type { Dashboard, MetricsInstrumentInit, Query } from '../types.ts';

export class MetricsInstrument extends BaseInstrument {
  #measurements: Measurements;

  dashboards: Dashboard[];

  sensors: SensorBase[] = [];

  constructor(store: Store, init: MetricsInstrumentInit = {}) {
    const { dashboards = [], disabled = false, measurements = [] } = init;
    super('metrics', store, disabled);
    this.dashboards = [...Inspector.defaultDashboards(), ...dashboards];
    this.#measurements = new Measurements({
      measurements: [...Inspector.defaultMeasurements(), ...measurements],
      store,
    });
  }

  async push(
    data: Record<
      string,
      {
        label?: string;
        values: number[];
      }[]
    >
  ) {
    return this.#measurements.push(data);
  }

  activate() {
    for (const [key, config] of this.#measurements.measurements) {
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
    for (const sensor of this.sensors) {
      sensor.destroy();
    }
    this.sensors = [];
    return super.deactivate();
  }

  async putToStore(_time: number, _label: string, _value: string) {
    // noop
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
    fn: (time: number, label: string, value: unknown) => void,
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
