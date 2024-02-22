import proc from 'node:process';
import { SensorBase } from './base.ts';

export class MemoryRssSensor extends SensorBase {
  async sample() {
    return proc.memoryUsage.rss();
  }
}
