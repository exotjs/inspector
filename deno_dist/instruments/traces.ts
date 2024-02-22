import { BaseInstrument } from './base.ts';
import { Tracer } from 'npm:@exotjs/trace@0.1.4';
import type { BaseInstrumentInit, Query } from '../types.ts';
import type { Store } from 'npm:@exotjs/measurements@0.1.5/types';
import { TraceSpan } from 'npm:@exotjs/trace@0.1.4/types';

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

  get addAttribute() {
    return this.tracer.addAttribute;
  }

  get addEvent() {
    return this.tracer.addEvent;
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
