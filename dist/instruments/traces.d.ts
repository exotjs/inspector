import { BaseInstrument } from '../base.js';
import type { BaseInstrumentInit, TraceSpan, TraceSpanOptions } from '../types.js';
import type { Store } from '@exotjs/inspector-measurements/types';
export declare class TracesInstrument extends BaseInstrument {
    constructor(store: Store, init?: BaseInstrumentInit);
    getEntryLabel(value: TraceSpan): string;
    getEntryTime(entry: TraceSpan): number;
    flattenSpan(span: TraceSpan): Omit<TraceSpan, 'end' | 'parent'>;
    serializeValue(value: TraceSpan): string;
    trace<T>(fn: (span: TraceSpan) => T, options?: TraceSpanOptions, onSpanCreated?: (span: TraceSpan) => void, onSpanEnded?: (span: TraceSpan) => void): Promise<T> | T;
    startSpan(options: TraceSpanOptions): TraceSpan;
}
