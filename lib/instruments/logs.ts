import { BaseInstrument } from './base.js';
import type { Store } from '@exotjs/measurements/types';
import type { BaseInstrumentInit, Query } from '../types.js';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);

export class LogsInstrument extends BaseInstrument {
  constructor(store: Store, init: BaseInstrumentInit = {}) {
    const { disabled = false } = init;
    super('logs', store, disabled);
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
    this.mountStdout();
    return super.activate();
  }

  deactivate() {
    this.unmountStdout();
    return super.deactivate();
  }

  mountStdout() {
    // @ts-expect-error ignore argument type errors
    process.stdout.write = (chunk, encoding, cb) => {
      if (typeof chunk === 'string') {
        this.push(this.stripAnsi(chunk), 'info');
      }
      return originalStdoutWrite(chunk, encoding, cb);
    };
  }

  unmountStdout() {
    process.stdout.write = originalStdoutWrite;
  }

  stripAnsi(str: string) {
    return str.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // eslint-disable-line
      ''
    );
  }
}
