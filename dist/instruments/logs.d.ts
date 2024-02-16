import { BaseInstrument } from './base.js';
import type { Store } from '@exotjs/measurements/types';
import type { BaseInstrumentInit, Query } from '../types.js';
export declare class LogsInstrument extends BaseInstrument {
    constructor(store: Store, init?: BaseInstrumentInit);
    putToStore(time: number, label: string, value: string): Promise<void>;
    queryFromStore(query: Query): Promise<import("@exotjs/measurements/types").StoreQueryResult>;
    activate(): boolean;
    deactivate(): boolean;
    mountStdout(): void;
    unmountStdout(): void;
    stripAnsi(str: string): string;
}
