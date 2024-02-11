import { BaseInstrument } from '../base.js';
import { getModulesFromCallStack } from '../helpers.js';
import type {
  BaseInstrumentInit,
  ErrorsInstrumentValue,
  Query,
} from '../types.js';
import type { Store } from '@exotjs/measurements/types';

export class ErrorsInstrument extends BaseInstrument<ErrorsInstrumentValue> {
  constructor(store: Store, init: BaseInstrumentInit = {}) {
    const { disabled = false } = init;
    super('errors', store, disabled);
  }

  async putToStore(time: number, label: string, value: any) {
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

  getEntryLabel(value: ErrorsInstrumentValue) {
    return value.server === false ? 'client' : 'server';
  }

  serializeValue(value: ErrorsInstrumentValue) {
    if (value instanceof Error) {
      value = {
        message: String(value.message),
        modules: getModulesFromCallStack(value.stack?.split('\n') || []),
        stack: value.stack,
      };
    }
    return JSON.stringify(value);
  }
}
