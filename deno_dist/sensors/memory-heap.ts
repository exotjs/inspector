import proc from 'node:process';
import { SensorBase } from './base.ts';

export class MemoryHeapSensor extends SensorBase {
  async sample() {
    return proc.memoryUsage().heapUsed;
  }
}
