import { describe, expect, it } from 'vitest';
import { Inspector } from '../lib/index.js';
import { MemoryStore } from '../lib/store.js';

describe('Inspector', () => {
  it('should create a new instance', () => {
    const inspector = new Inspector({
      store: new MemoryStore(),
    });
    expect(inspector).toBeInstanceOf(Inspector);
  });
});
