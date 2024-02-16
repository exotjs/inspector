import { BaseInstrument } from './base.js';
import type { NetworkInstrumentInit, NetworkRequest, Query } from '../types.js';
import type { Store } from '@exotjs/measurements/types';
export declare class NetworkInstrument extends BaseInstrument {
    #private;
    constructor(store: Store, init?: NetworkInstrumentInit);
    putToStore(time: number, label: string, value: string): Promise<void>;
    queryFromStore(query: Query): Promise<import("@exotjs/measurements/types").StoreQueryResult>;
    getEntryLabel(value: NetworkRequest): string;
    serializeValue(value: NetworkRequest): string;
    get fetch(): (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
    activate(): boolean;
    deactivate(): boolean;
    push(request: NetworkRequest): Promise<void>;
    createFetch(fetchFn?: typeof fetch): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    interceptFetch(): void;
    interceptHttp(): void;
    restoreFetch(): void;
    restoreHttp(): void;
}
