import proc from 'node:process';
import { SensorBase } from '../base.js';
export class MemoryRssSensor extends SensorBase {
    async sample() {
        return proc.memoryUsage.rss();
    }
}
