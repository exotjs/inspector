import os from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Inspector } from '../lib/index.js';
import { MemoryStore } from '../lib/store.js';
import { ErrorsInstrument } from '../lib/instruments/errors.js';
import { EventsInstrument } from '../lib/instruments/events.js';
import { LogsInstrument } from '../lib/instruments/logs.js';
import { MetricsInstrument } from '../lib/instruments/metrics.js';
import { NetworkInstrument } from '../lib/instruments/network.js';
import { TracesInstrument } from '../lib/instruments/traces.js';
import { Session } from '../lib/session.js';

describe('Inspector', () => {
  let inspector: Inspector;

  beforeEach(() => {
    inspector = new Inspector({
      store: new MemoryStore(),
    });
  });

  afterEach(() => {
    if (inspector) {
      inspector.destroy();
    }
  });

  describe('.instruments', () => {
    it('should have "errors" instrument', () => {
      expect(inspector.instruments.errors).toBeInstanceOf(ErrorsInstrument);
    });

    it('should have "events" instrument', () => {
      expect(inspector.instruments.events).toBeInstanceOf(EventsInstrument);
    });

    it('should have "logs" instrument', () => {
      expect(inspector.instruments.logs).toBeInstanceOf(LogsInstrument);
    });

    it('should have "metrics" instrument', () => {
      expect(inspector.instruments.metrics).toBeInstanceOf(MetricsInstrument);
    });

    it('should have "network" instrument', () => {
      expect(inspector.instruments.network).toBeInstanceOf(NetworkInstrument);
    });

    it('should have "traces" instrument', () => {
      expect(inspector.instruments.traces).toBeInstanceOf(TracesInstrument);
    });
  });

  describe('.env', () => {
    it('should return env variables', () => {
      const env = inspector.env;
      expect(env.PWD).toEqual(process.env.PWD);
      expect(env.USER).toEqual(process.env.USER);
    });
  });

  describe('.info', () => {
    it('should return host info', () => {
      const info = inspector.info;
      expect(info.apiVersion).toBeDefined();
      expect(info.arch).toEqual(os.arch());
      expect(info.cpus).toBeGreaterThan(0);
      expect(info.cpuModel).toBeDefined();
      expect(info.hostname).toEqual(os.hostname());
      expect(info.memory).toEqual(os.totalmem());
      expect(info.platform).toEqual(os.platform());
      expect(info.runtime).toBeDefined();
      expect(info.runtimeVersion).toBeDefined();
      expect(info.startedAt).toBeGreaterThan(0);
    });
  });

  describe('.activate()', () => {
    it('should active all instruments', () => {
      inspector.deactivate();
      expect(inspector.instruments.errors.active).toEqual(false);
      expect(inspector.instruments.logs.active).toEqual(false);
      inspector.activate();
      expect(inspector.instruments.errors.active).toEqual(true);
      expect(inspector.instruments.logs.active).toEqual(true);
    });
  });

  describe('.deactivate()', () => {
    it('should deactive all instruments', () => {
      inspector.activate();
      expect(inspector.instruments.errors.active).toEqual(true);
      expect(inspector.instruments.logs.active).toEqual(true);
      inspector.deactivate();
      expect(inspector.instruments.errors.active).toEqual(false);
      expect(inspector.instruments.logs.active).toEqual(false);
    });
  });

  describe('.createSession()', () => {
    it('should create a new client session', () => {
      const session = inspector.createSession();
      expect(session).instanceOf(Session);
    });

    it('should create a new client session with remoteAddress and user', () => {
      const session = inspector.createSession({
        remoteAddress: '10.0.0.1',
        user: 'test user',
      });
      expect(session).instanceOf(Session);
      expect(session.remoteAddress).toEqual('10.0.0.1');
      expect(session.user).toEqual('test user');
    });
  });

  describe('.getInstrument()', () => {
    it('should return an instrument by name', () => {
      expect(inspector.getInstrument('logs')).toBeInstanceOf(LogsInstrument);
    });

    it('should throw if instrument does not exist', () => {
      expect(() =>
        inspector.getInstrument('wrong instrument' as any)
      ).toThrow();
    });
  });
});
