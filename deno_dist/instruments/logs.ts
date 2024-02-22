import process from "node:process";
import { AsyncLocalStorage } from 'node:async_hooks';
import utils from 'node:util';
import { BaseInstrument } from './base.ts';
import type { Store } from 'npm:@exotjs/measurements@0.1.5/types';
import type { LogsInstrumentInit, Query } from '../types.ts';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalConsoleDescriptors = Object.getOwnPropertyDescriptors(console);

export class LogsInstrument extends BaseInstrument {
  static CONSOLE_LEVELS = {
    assert: 'warn',
    count: 'info',
    debug: 'debug',
    dir: 'info',
    error: 'error',
    info: 'info',
    log: 'info',
    trace: 'error',
    warn: 'warn',
  };

  #als = new AsyncLocalStorage<boolean>();

  console: boolean = true;

  stdout: boolean = true;

  constructor(store: Store, init: LogsInstrumentInit = {}) {
    const { console: interceptConsole = true, disabled = false, stdout: interceptStdout = true } = init;
    super('logs', store, disabled);
    this.console = interceptConsole;
    this.stdout = interceptStdout;
  }

  async putToStore(time: number, label: string, value: string) {
    return this.store.listAdd(this.name, time, label, value);
  }

  async queryFromStore(query: Query) {
    return this.store.listQuery(
      this.name,
      query.startTime,
      query.endTime,
      query.limit
    );
  }

  activate() {
    if (this.stdout) {
      this.interceptStdout();
    }
    return super.activate();
  }

  deactivate() {
    if (this.stdout) {
      this.restoreStdout();
    }
    return super.deactivate();
  }

  interceptConsole() {
    for (const method in LogsInstrument.CONSOLE_LEVELS) {
      const level = LogsInstrument.CONSOLE_LEVELS[method as keyof typeof LogsInstrument.CONSOLE_LEVELS];
      const desc = originalConsoleDescriptors[method];
      // @ts-expect-error
      console[method] = (...args: unknown[]) => {
        return this.#als.run(true, () => {
          this.push(utils.format(...args), level);
          return desc.value(...args);
        });
      };
    }
  }

  interceptStdout() {
    // @ts-expect-error ignore argument type errors
    process.stdout.write = (chunk, encoding, cb) => {
      if (typeof chunk === 'string' && !this.#als.getStore()) {
        this.push(this.stripAnsi(chunk), 'info');
      }
      return originalStdoutWrite(chunk, encoding, cb);
    };
  }

  restoreConsole() {
    for (const method in LogsInstrument.CONSOLE_LEVELS) {
      const desc = originalConsoleDescriptors[method];
      // @ts-expect-error
      console[method] = desc.value;
    }
  }

  restoreStdout() {
    process.stdout.write = originalStdoutWrite;
  }

  stripAnsi(str: string) {
    return str.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // eslint-disable-line
      ''
    );
  }
}