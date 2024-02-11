import { BaseInstrument } from '../base.js';
import { Tracer } from '@exotjs/trace';
import type { BaseInstrumentInit, Query } from '../types.js';
import type { Store } from '@exotjs/measurements/types';
import { TraceSpan } from '@exotjs/trace/types';

export class TracesInstrument extends BaseInstrument {
  readonly tracer: Tracer;

  constructor(store: Store, init: BaseInstrumentInit = {}) {
    const { disabled = false } = init;
    super('traces', store, disabled);
    this.tracer = new Tracer();
    this.tracer.on('endSpan', (span) => {
      if (!span.parent) {
        this.push(span);
      }
    });
  }

  get endSpan() {
    return this.tracer.endSpan;
  }

  get startSpan() {
    return this.tracer.startSpan;
  }

  get trace() {
    return this.tracer.trace;
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

  getEntryLabel(value: TraceSpan): string {
    return String(value.attributes?.label || '');
  }

  getEntryTime(entry: TraceSpan) {
    return Math.floor(entry.start);
  }

  serializeValue(value: TraceSpan): string {
    return JSON.stringify(value);
  }
}
