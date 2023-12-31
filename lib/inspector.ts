import os from 'node:os';
import proc from 'node:process';
import { Measurements } from "@exotjs/inspector-measurements";
import { CpuSensor } from "./sensors/cpu";
import { SensorBase } from "./types";
import { MemoryRssSensor } from './sensors/memory-rss';
import { MemoryHeapSensor } from './sensors/memory-heap';
import { EventLoopDelaySensor } from './sensors/event-loop-delay';
import { Logs } from './logs';
import { WebSocketController } from './websocket';

export interface InspectorInit {
  measurements: {
    name: string;
    sensor?: string;
    type?: 'number' | 'counter' | 'value';
  }[];
}

export interface InspectorHost {
  arch: string;
  cpus: number;
  cpuModel: string;
  hostname: string;
  memory: number;
  platform: string;
}

export interface InspectorRuntime {
  name: string;
  version: string;
}

export class Inspector {
  #sampleInterval?: NodeJS.Timeout;

  host!: InspectorHost;

  logs: Logs;

  measurements: Measurements;

  runtime!: InspectorRuntime;

  sensors: SensorBase[] = [];

  constructor(readonly init: InspectorInit) {
    this.readHost();
    this.readRuntime();
    this.logs = new Logs({});
    this.measurements = new Measurements({
      measurements: this.init.measurements.map(({ name, type }) => {
        return {
          interval: 20000,
          key: name,
          type: type || 'number',
        };
      }),
    });
  }

  readHost() {
    const cpus = os.cpus();
    this.host = {
      arch: os.arch(),
      cpus: cpus.length,
      cpuModel: cpus[0]?.model || '',
      hostname: os.hostname(),
      memory: os.totalmem(),
      platform: os.platform(),
    };
  }

  readRuntime() {
    const name = (proc.title?.match(/[^\w]/) ? proc.release.name : proc.title) || 'node';
    this.runtime = {
      name,
      version: proc.versions[name] || proc.version,
    };
  }

  createWebSocketController() {
    return new WebSocketController(this);
  }

  async sample() {
    const samples = await Promise.all(this.sensors.map((sensor) => sensor.sample()));
    this.measurements.push(samples.reduce((acc, sample, i) => {
      acc[this.init.measurements[i].name] = [sample];
      return acc;
    }, {} as Record<string, number[]>));
  }

  async start() {
    for (let { name, sensor } of this.init.measurements) {
      if (sensor) {
        const cls = this.#getSensor(sensor);
        this.sensors.push(new cls(name));
      }
    }
    this.#sampleInterval = setInterval(() => {
      this.sample();
    }, 5000);
    this.logs.mountStdout();
  }

  async stop() {
    if (this.#sampleInterval) {
      clearInterval(this.#sampleInterval);
      this.#sampleInterval = void 0;
    }
    this.logs.unmountStdout();
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

/*
const ins = new Inspector({
  measurements: [{
    name: 'cpu',
    sensor: 'cpu',
  }, {
    name: 'mem',
    sensor: 'memory-rss',
  }, {
    name: 'eld',
    sensor: 'event-loop-delay',
  }],
});

console.log('>', ins.host);
console.log(ins.runtime)

ins.start();

setInterval(() => {
  console.log('>', JSON.stringify(ins.measurements.export(), null, '  '));
}, 6000);

setInterval(() => {
  var now = Date.now();
  while (Date.now() - now < 500);
}, 1000);
*/