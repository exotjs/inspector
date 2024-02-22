import { BaseInstrument } from './base.ts';
import type {
  BaseInstrumentInit,
  EventsInstrumentValue,
  Query,
} from '../types.ts';
import type { Store } from 'npm:@exotjs/measurements@0.1.5/types';

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
