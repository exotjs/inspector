import { Store, StoreEntry } from '@exotjs/measurements/types';
import { BaseInstrument, SensorBase } from '../base.js';
import type { Dashboard, MeasurementsInstrumentInit, Query, TrackResponse } from '../types.js';
export declare class MeasurementsInstrument extends BaseInstrument {
    #private;
    dashboards: Dashboard[];
    sensors: SensorBase[];
    constructor(store: Store, init?: MeasurementsInstrumentInit);
    trackResponse(response: TrackResponse): void;
    activate(): boolean;
    deactivate(): boolean;
    query(store: Store, query: Query & {
        keys: string[];
    }): Promise<{
        entries: StoreEntry[];
        hasMore: boolean;
    }>;
    subscribe(fn: (time: number, label: string, value: any) => void, options: {
        interval?: number;
        keys?: string[];
        startTime?: number;
    }): () => void;
}
