import { BaseInstrument } from './base.js';
import { Tracer } from '@exotjs/trace';
import type { BaseInstrumentInit, Query } from '../types.js';
import type { Store } from '@exotjs/measurements/types';
import { TraceSpan } from '@exotjs/trace/types';
export declare class TracesInstrument extends BaseInstrument {
    readonly tracer: Tracer;
    constructor(store: Store, init?: BaseInstrumentInit);
    get addAttribute(): (span: TraceSpan, name: string, value: unknown) => void;
    get addEvent(): (span: TraceSpan, text: string, attributes?: import("@exotjs/trace/types").Attributes | undefined) => void;
    get endSpan(): (span: TraceSpan) => TraceSpan | undefined;
    get startSpan(): (name: string, parent?: TraceSpan | undefined) => TraceSpan;
    get trace(): <T>(name: string, fn: (ctx: import("@exotjs/trace/types").TraceContext) => T | Promise<T>, options?: import("@exotjs/trace/types").TraceOptions | undefined) => T | Promise<T>;
    putToStore(time: number, label: string, value: string): Promise<void>;
    queryFromStore(query: Query): Promise<import("@exotjs/measurements/types").StoreQueryResult>;
    getEntryLabel(value: TraceSpan): string;
    getEntryTime(entry: TraceSpan): number;
    serializeValue(value: TraceSpan): string;
}
