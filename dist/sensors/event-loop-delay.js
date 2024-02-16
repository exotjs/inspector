import proc from 'node:process';
import { SensorBase } from './base.js';
export class EventLoopDelaySensor extends SensorBase {
    async sample() {
        return new Promise((resolve) => {
            const start = proc.hrtime.bigint();
            setTimeout(() => {
                const delay = Math.floor(Number(proc.hrtime.bigint() - start) / 1000000);
                resolve(delay);
            });
        });
    }
}
