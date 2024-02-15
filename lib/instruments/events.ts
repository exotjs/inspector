import { BaseInstrument } from '../base.js';
import type {
  BaseInstrumentInit,
  EventsInstrumentValue,
  Query,
} from '../types.js';
import type { Store } from '@exotjs/measurements/types';

export class EventsInstrument extends BaseInstrument<EventsInstrumentValue> {
  constructor(store: Store, init: BaseInstrumentInit = {}) {
    const { disabled = false } = init;
    super('events', store, disabled);
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

  getEntryLabel(_value: EventsInstrumentValue) {
    return '';
  }

  serializeValue(value: EventsInstrumentValue) {
    return JSON.stringify(value);
  }
}
