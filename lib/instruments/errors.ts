import { BaseInstrument } from './base.js';
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

  serializeValue(value: ErrorsInstrumentValue) {
    if (value instanceof Error) {
      value = {
        message: String(value.message),
        stack: value.stack,
      };
    } else if (value.error) {
      if (!value.message) {
        value.message = value.error.message;
      }
      if (!value.stack) {
        value.stack = value.error.stack;
      }
    }
    if (value.modules === void 0 && value.stack) {
      value.modules = getModulesFromCallStack(value.stack?.split('\n') || []);
    }
    return JSON.stringify(value);
  }
}
