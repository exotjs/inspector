import { beforeAll, describe, expect, it, vi } from 'vitest';
import pino from 'pino';
import { MemoryStore } from '../../lib/store.js';
import { LogsInstrument } from '../../lib/instruments/logs.js';

describe('Logs', () => {
  const store = new MemoryStore();
  let logs: LogsInstrument;

  beforeAll(() => {
    logs = new LogsInstrument(store, {});
  });

  describe('.interceptConsole()', () => {
    it('should intercept console.log and push to logs', () => {
      const spy = vi.spyOn(logs, 'push');
      spy.mockImplementation(async (text, label) => {
        expect(text).toEqual('test');
        expect(label).toEqual('info');
      });
      logs.interceptConsole();
      console.log('test');
      expect(spy).toHaveBeenCalled();
    });

    it('should intercept console.error and push to logs', () => {
      const spy = vi.spyOn(logs, 'push');
      spy.mockImplementation(async (text, label) => {
        expect(text).toEqual('test');
        expect(label).toEqual('error');
      });
      logs.interceptConsole();
      console.error('test');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('.restoreConsole()', () => {
    it('should restore the original console.log', () => {
      const spy = vi.spyOn(logs, 'push');
      logs.interceptConsole();
      logs.restoreConsole();
      console.log('test');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('.interceptStdout()', () => {
    it('should intercept stdout and push to logs', () => {
      const spy = vi.spyOn(logs, 'push');
      spy.mockImplementation(async (text, label) => {
        expect(text).toEqual('test');
        expect(label).toEqual('info');
      });
      logs.interceptStdout();
      process.stdout.write('test');
      expect(spy).toHaveBeenCalled();
      spy.mockReset();
    });

    it('should intercept stdout and push to logs only once when logged via console.log ', () => {
      const spy = vi.spyOn(logs, 'push');
      spy.mockImplementation(async (text, label) => {
        expect(text).toEqual('test');
        expect(label).toEqual('info');
      });
      logs.interceptConsole();
      logs.interceptStdout();
      console.log('test');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockReset();
    });
  });

  describe('.restoreStdout()', () => {
    it('should restore the original stdout.write', () => {
      const spy = vi.spyOn(logs, 'push');
      logs.interceptStdout();
      logs.restoreStdout();
      process.stdout.write('test');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Pino', () => {
    const logger = pino(process.stdout);

    it('should intercept pino logger', () => {
      const spy = vi.spyOn(logs, 'push');
      spy.mockImplementation(async (text, label) => {
        expect(JSON.parse(text)).toEqual({
          hostname: expect.any(String),
          level: 30,
          msg: 'test',
          pid: process.pid,
          time: expect.any(Number),
        });
        expect(label).toEqual('info');
      });
      logs.interceptStdout();
      logger.info('test');
      expect(spy).toHaveBeenCalled();
    });
  });
});
