/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { Store, StoreQueryResult } from '@exotjs/measurements/types';
import type { InspectorInstruments, Query } from '../types.js';
export declare abstract class BaseInstrument<Value = any> extends EventEmitter {
    name: InspectorInstruments;
    store: Store;
    active: boolean;
    disabled: boolean;
    constructor(name: InspectorInstruments, store: Store, disabled?: boolean);
    getEntryLabel(_value: Value): string;
    getEntryTime(_value: Value): number;
    serializeValue(value: Value): any;
    activate(): boolean;
    deactivate(): boolean;
    push(value: Value, label?: string, time?: number): Promise<void>;
    query(query: Query): Promise<StoreQueryResult>;
    putToStore(time: number, label: string, value: any): Promise<void>;
    queryFromStore(query: Query): Promise<StoreQueryResult>;
    subscribe(fn: (time: number, label: string, value: any) => void, _options?: unknown): () => void;
}
