import proc from 'node:process';
import { SensorBase } from '../types';

export class MemoryRssSensor extends SensorBase {
  async sample() {
    return proc.memoryUsage.rss();
  }
}
