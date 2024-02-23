import { BaseInstrument } from './base.js';
import type { BaseInstrumentInit, ErrorsInstrumentValue, Query } from '../types.js';
import type { Store } from '@exotjs/measurements/types';
export declare class ErrorsInstrument extends BaseInstrument<ErrorsInstrumentValue> {
    constructor(store: Store, init?: BaseInstrumentInit);
    putToStore(time: number, label: string, value: string): Promise<void>;
    queryFromStore(query: Query): Promise<import("@exotjs/measurements/types").StoreQueryResult>;
    serializeValue(value: ErrorsInstrumentValue): string;
}
