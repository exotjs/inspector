import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CpuSensor } from '../../lib/sensors/cpu.js';

describe('CPU sensor', () => {
  let sensor: CpuSensor;

  beforeEach(() => {
    sensor = new CpuSensor('cpu');
  });

  afterEach(() => {
    if (sensor) {
      sensor.destroy();
    }
  });

  describe('.sample()', () => {
    it('should return the cpu usage', async () => {
      const result = await sensor.sample();
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
