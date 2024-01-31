import { BaseInstrument } from '../base.js';
import type {
  BaseInstrumentInit,
  TraceSpan,
  TraceSpanOptions,
} from '../types.js';
import type { Store } from '@exotjs/measurements/types';

export class TracesInstrument extends BaseInstrument {
  constructor(store: Store, init: BaseInstrumentInit = {}) {
    const { disabled = false } = init;
    super('traces', store, disabled);
  }

  getEntryLabel(value: TraceSpan): string {
    return value.label || '';
  }

  getEntryTime(entry: TraceSpan) {
    return Math.floor(entry.start);
  }

  flattenSpan(span: TraceSpan): Omit<TraceSpan, 'end' | 'parent'> {
    if (span.end) {
      // @ts-expect-error
      delete span.end;
    }
    if (span.parent) {
      delete span.parent;
    }
    if (span.traces?.length) {
      for (let child of span.traces) {
        this.flattenSpan(child);
      }
    }
    return span;
  }

  serializeValue(value: TraceSpan): string {
    return JSON.stringify(this.flattenSpan(value));
  }

  trace<T>(
    fn: (span: TraceSpan) => T,
    options?: TraceSpanOptions,
    onSpanCreated?: (span: TraceSpan) => void,
    onSpanEnded?: (span: TraceSpan) => void,
  ): Promise<T> | T {
    const span = this.startSpan({
      name: fn.name,
      ...options,
    });
    const end = () => {
      span.end();
      if (onSpanEnded) {
        onSpanEnded(span);
      }
    };
    if (onSpanCreated) {
      onSpanCreated(span);
    }
    let result: T | undefined = undefined;
    try {
      result = fn(span);
    } finally {
      if (result instanceof Promise) {
        return result.finally(() => {
          end();
        });
      }
      end();
    }
    return result;
  }

  startSpan(options: TraceSpanOptions): TraceSpan {
    const span: TraceSpan = {
      attributes: options.attributes,
      description: options.description,
      duration: 0,
      label: options.label,
      name: options.name,
      parent: options.parent,
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
