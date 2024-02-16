import { Store, StoreEntry } from '@exotjs/measurements/types';
import { BaseInstrument } from './base.js';
import { SensorBase } from '../sensors/base.js';
import type { Dashboard, MetricsInstrumentInit, Query } from '../types.js';
export declare class MetricsInstrument extends BaseInstrument {
    #private;
    dashboards: Dashboard[];
    sensors: SensorBase[];
    constructor(store: Store, init?: MetricsInstrumentInit);
    push(data: Record<string, {
        label?: string;
        values: number[];
    }[]>): Promise<void>;
    activate(): boolean;
    deactivate(): boolean;
    putToStore(_time: number, _label: string, _value: string): Promise<void>;
    query(query: Query & {
        keys: string[];
    }): Promise<{
        entries: StoreEntry[];
        hasMore: boolean;
    }>;
    subscribe(fn: (time: number, label: string, value: unknown) => void, options: {
        interval?: number;
        keys?: string[];
        startTime?: number;
    }): () => void;
}
