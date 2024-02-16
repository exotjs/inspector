import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRssSensor } from '../../lib/sensors/memory-rss.js';

describe('MemoryHeap sensor', () => {
  let sensor: MemoryRssSensor;

  beforeEach(() => {
    sensor = new MemoryRssSensor('rss');
  });

  afterEach(() => {
    if (sensor) {
      sensor.destroy();
    }
  });

  describe('.sample()', () => {
    it('should return the memory usage', async () => {
      const result = await sensor.sample();
      expect(result).toBeGreaterThan(0);
    });
  });
});
