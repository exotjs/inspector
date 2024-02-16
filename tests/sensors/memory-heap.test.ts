import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryHeapSensor } from '../../lib/sensors/memory-heap.js';

describe('MemoryHeap sensor', () => {
  let sensor: MemoryHeapSensor;

  beforeEach(() => {
    sensor = new MemoryHeapSensor('heap');
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
