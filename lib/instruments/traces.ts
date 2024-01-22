import { BaseInstrument } from '../base.js';
import type {
  BaseInstrumentInit,
  TraceSpan,
  TraceSpanOptions,
} from '../types.js';
import type { Store } from '@exotjs/inspector-measurements/types';

export class TracesInstrument extends BaseInstrument {
  constructor(store: Store, init: BaseInstrumentInit = {}) {
    const { disabled = false } = init;
    super('traces', store, disabled);
  }

  getEntryTime(entry: any) {
    return Math.floor(entry.start);
  }

  trace<T>(
    fn: (span: TraceSpan) => T,
    options?: TraceSpanOptions,
  ): Promise<T> | T {
    const span = this.startSpan({
      name: fn.name,
      ...options,
    });
    const result = fn(span);
    if (result instanceof Promise) {
      return result.finally(() => {
        span.end();
      });
    }
    span.end();
    return result;
  }

  startSpan(options: TraceSpanOptions): TraceSpan {
    const span: TraceSpan = {
      attributes: options.attributes,
      description: options.description,
      duration: 0,
      label: options.label,
      name: options.name,
      start:
        Math.floor((performance.timeOrigin + performance.now()) * 100) / 100,
      traceId: options.traceId,
      end: () => {
        if (!span.duration) {
          span.duration =
            Math.floor(
              (performance.timeOrigin + performance.now() - span.start) * 100,
            ) / 100;
          if (span.traces?.length) {
            for (let sub of span.traces) {
              sub.end();
            }
          }
          if (!options.parent) {
            this.push(span);
          }
        }
        return span;
      },
    };
    if (options.parent) {
      if (!options.parent.traces) {
        options.parent.traces = [];
      }
      options.parent.traces.push(span as TraceSpan);
    }
    return span;
  }
}
