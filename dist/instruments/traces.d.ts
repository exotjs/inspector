import { BaseInstrument } from '../base.js';
import type { BaseInstrumentInit, TraceSpan, TraceSpanOptions } from '../types.js';
import type { Store } from '@exotjs/inspector-measurements/types';
export declare class TracesInstrument extends BaseInstrument {
    constructor(store: Store, init?: BaseInstrumentInit);
    getEntryTime(entry: any): number;
    trace<T>(fn: (span: TraceSpan) => T, options?: TraceSpanOptions): Promise<T> | T;
    startSpan(options: TraceSpanOptions): TraceSpan;
}
