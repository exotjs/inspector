import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Session } from '../lib/session.js';
import { Inspector } from '../lib/index.js';
import { MemoryStore } from '../lib/store.js';

describe('Session', () => {
  const inspector = new Inspector({
    store: new MemoryStore(),
  });
  let session: Session;

  beforeEach(() => {
    session = new Session(inspector, {
      remoteAddress: '10.0.0.1',
      user: 'test',
    });
  });

  afterEach(() => {
    if (session) {
      session.destroy();
    }
  });

  describe('.toJSON()', () => {
    it('should return object', () => {
      expect(session.toJSON()).toEqual({
        id: expect.any(String),
        startedAt: expect.any(Number),
        remoteAddress: session.remoteAddress,
        user: session.user,
      });
    });
  });

  describe('.handleMessage()', () => {
    it('should handle string message and emit "message" event', async () => {
      const onMessage = vi.fn();
      session.once('message', onMessage);
      await session.handleMessage(
        JSON.stringify({
          id: 1,
          type: 'hello',
        })
      );
      expect(onMessage).toHaveBeenCalled();
    });

    it('should ignore malformated JSON', async () => {
      const onMessage = vi.fn();
      session.once('message', onMessage);
      await session.handleMessage('invalid json');
      expect(onMessage).not.toHaveBeenCalled();
    });

    it('should ignore non-string data', async () => {
      const onMessage = vi.fn();
      session.once('message', onMessage);
      await session.handleMessage(new Uint8Array(10));
      expect(onMessage).not.toHaveBeenCalled();
    });
  });
});
