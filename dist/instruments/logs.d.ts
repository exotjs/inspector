import { BaseInstrument } from './base.js';
import type { Store } from '@exotjs/measurements/types';
import type { LogsInstrumentInit, Query } from '../types.js';
export declare class LogsInstrument extends BaseInstrument {
    #private;
    static CONSOLE_LEVELS: {
        assert: string;
        count: string;
        debug: string;
        dir: string;
        error: string;
        info: string;
        log: string;
        trace: string;
        warn: string;
    };
    constructor(store: Store, init?: LogsInstrumentInit);
    putToStore(time: number, label: string, value: string): Promise<void>;
    queryFromStore(query: Query): Promise<import("@exotjs/measurements/types").StoreQueryResult>;
    activate(): boolean;
    deactivate(): boolean;
    interceptConsole(): void;
    interceptStdout(): void;
    restoreConsole(): void;
    restoreStdout(): void;
    stripAnsi(str: string): string;
}
