import { BaseInstrument } from '../base.js';
import type { BaseInstrumentInit, ErrorsInstrumentValue } from '../types.js';
import type { Store } from '@exotjs/measurements/types';
export declare class ErrorsInstrument extends BaseInstrument<ErrorsInstrumentValue> {
    constructor(store: Store, init?: BaseInstrumentInit);
    getEntryLabel(value: ErrorsInstrumentValue): "client" | "server";
    serializeValue(value: ErrorsInstrumentValue): string;
}
