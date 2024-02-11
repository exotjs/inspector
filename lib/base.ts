import { EventEmitter } from 'node:events';
import { Store, StoreQueryResult } from '@exotjs/measurements/types';
import type { InspectorInstruments, Query } from './types.js';

export abstract class BaseInstrument<Value = any> extends EventEmitter {
  active: boolean = false;

  disabled: boolean = false;

  constructor(
    public name: InspectorInstruments,
    public store: Store,
    disabled: boolean = false
  ) {
    super();
    this.disabled = disabled;
    if (!this.disabled) {
      this.active = true;
    }
  }

  getEntryLabel(value: Value) {
    return '';
  }

  getEntryTime(value: Value) {
    return Date.now();
  }

  serializeValue(value: Value): any {
    return value;
  }

  activate(): boolean {
    if (!this.disabled) {
      this.active = true;
    }
    return this.active;
  }

  deactivate(): boolean {
    this.active = false;
    return !this.active;
  }

  async push(
    value: Value,
    label: string = this.getEntryLabel(value),
    time = this.getEntryTime(value)
  ) {
    if (this.active) {
      const serialized = this.serializeValue(value);
      await this.putToStore(time, label, serialized);
      this.emit('push', time, label, serialized);
    }
  }

  async query(query: Query): Promise<StoreQueryResult> {
    return this.queryFromStore(query);
  }

  async putToStore(time: number, label: string, value: any) {
    return this.store.setAdd(this.name, time, label, value);
  }

  async queryFromStore(query: Query) {
    return this.store.setQuery(
      this.name,
      query.startTime,
      query.endTime,
      query.limit
    );
  }

  subscribe(
    fn: (time: number, label: string, value: any) => void,
    options?: unknown
  ): () => void {
    this.on('push', fn);
    return () => {
      this.off('push', fn);
    };
  }
}

export abstract class SensorBase extends EventEmitter {
  #sampleInterval: NodeJS.Timeout;

  constructor(
    public name: string,
    public inverval: number = 5000
  ) {
    super();
    this.#sampleInterval = setInterval(() => {
      this.sample()
        .then((value) => {
          this.emit('sample', value);
        })
        .catch(() => {
          // TODO:
        });
    }, this.inverval);
  }

  destroy() {
    if (this.#sampleInterval) {
      clearInterval(this.#sampleInterval);
    }
    this.removeAllListeners();
  }

  abstract sample(): Promise<number>;
}
