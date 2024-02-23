import {
  assertEquals,
  assertExists,
} from 'https://deno.land/std@0.213.0/assert/mod.ts';
import { Inspector } from '../deno_dist/index.ts';
import { MemoryStore } from '../deno_dist/store.ts';

/**
 * Run the tests with --allow-env --allow-sys
 */

Deno.test('Inspector', async (t) => {
  await t.step('should create a new Inspector instance', () => {
    const inspector = new Inspector({
      store: new MemoryStore(),
    });
    assertExists(inspector.info);
    inspector.destroy();
  });
});
