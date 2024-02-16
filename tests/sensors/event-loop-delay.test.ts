import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EventLoopDelaySensor } from '../../lib/sensors/event-loop-delay.js';

describe('EventLoopDelay sensor', () => {
  let sensor: EventLoopDelaySensor;

  beforeEach(() => {
    sensor = new EventLoopDelaySensor('eld');
  });

  afterEach(() => {
    if (sensor) {
      sensor.destroy();
    }
  });

  describe('.sample()', () => {
    it('should return the event loop delay', async () => {
      const result = await sensor.sample();
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
