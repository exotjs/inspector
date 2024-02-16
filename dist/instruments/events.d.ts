import { BaseInstrument } from './base.js';
import type { BaseInstrumentInit, EventsInstrumentValue, Query } from '../types.js';
import type { Store } from '@exotjs/measurements/types';
export declare class EventsInstrument extends BaseInstrument<EventsInstrumentValue> {
    constructor(store: Store, init?: BaseInstrumentInit);
    putToStore(time: number, label: string, value: string): Promise<void>;
    queryFromStore(query: Query): Promise<import("@exotjs/measurements/types").StoreQueryResult>;
    getEntryLabel(_value: EventsInstrumentValue): string;
    serializeValue(value: EventsInstrumentValue): string;
}
