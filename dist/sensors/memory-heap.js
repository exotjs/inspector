import proc from 'node:process';
import { SensorBase } from '../base.js';
export class MemoryHeapSensor extends SensorBase {
    async sample() {
        return proc.memoryUsage().heapUsed;
    }
}
