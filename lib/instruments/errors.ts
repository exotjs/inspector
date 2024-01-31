import { BaseInstrument } from '../base.js';
import { getModulesFromCallStack } from '../helpers.js';
import type { BaseInstrumentInit, ErrorsInstrumentValue } from '../types.js';
import type { Store } from '@exotjs/measurements/types';

export class ErrorsInstrument extends BaseInstrument<ErrorsInstrumentValue> {
  constructor(store: Store, init: BaseInstrumentInit = {}) {
    const { disabled = false } = init;
    super('errors', store, disabled);
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
