/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { Store, StoreQueryResult } from '@exotjs/inspector-measurements/types';
import type { InspectorInstruments, Query } from './types.js';
export declare abstract class BaseInstrument<Value = any> extends EventEmitter {
    name: InspectorInstruments;
    store: Store;
    active: boolean;
    disabled: boolean;
    constructor(name: InspectorInstruments, store: Store, disabled?: boolean);
    bindStore(): void;
    getEntryLabel(value: Value): string;
    getEntryTime(value: Value): number;
    serializeValue(value: Value): any;
    activate(): boolean;
    deactivate(): boolean;
    push(value: Value, label?: string, time?: number): Promise<void>;
    query(store: Store, query: Query): Promise<StoreQueryResult>;
    subscribe(fn: (time: number, label: string, value: any) => void, options?: any): () => void;
}
export declare abstract class SensorBase extends EventEmitter {
    #private;
    name: string;
    inverval: number;
    constructor(name: string, inverval?: number);
    destroy(): void;
    abstract sample(): Promise<number>;
}