import proc from 'node:process';
import { SensorBase } from '../base.js';

export class CpuSensor extends SensorBase {
  #prevUsage?: NodeJS.CpuUsage;

  #prevUsageTime?: bigint;

  async sample() {
    if (typeof proc['cpuUsage'] === 'function') {
      const usage = proc.cpuUsage(this.#prevUsage);
      const now = proc.hrtime.bigint();
      let result: number = 0;
      if (this.#prevUsageTime) {
        const elapsed = now - this.#prevUsageTime;
        result =
          Number(BigInt((usage.system + usage.user) * 10000) / elapsed) / 100;
      }
      this.#prevUsageTime = now;
      this.#prevUsage = proc.cpuUsage();
      return result;
    }
    return 0;
  }
}
