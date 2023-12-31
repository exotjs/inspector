import proc from 'node:process';
import { SensorBase } from '../types';

export class MemoryHeapSensor extends SensorBase {
  async sample() {
    return proc.memoryUsage().heapUsed;
  }
}
