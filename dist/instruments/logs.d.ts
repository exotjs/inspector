import { BaseInstrument } from '../base.js';
import type { Store } from '@exotjs/measurements/types';
import type { BaseInstrumentInit } from '../types.js';
export declare class LogsInstrument extends BaseInstrument {
    constructor(store: Store, init?: BaseInstrumentInit);
    activate(): boolean;
    deactivate(): boolean;
    mountStdout(): void;
    unmountStdout(): void;
    stripAnsi(str: string): string;
}
