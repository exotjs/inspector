/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { Inspector } from './inspector.js';
import type { SessionInit } from './types.js';
export declare class Session extends EventEmitter {
    #private;
    readonly inspector: Inspector;
    id: string;
    remoteAddress: string;
    startedAt: number;
    user: string;
    constructor(inspector: Inspector, init?: SessionInit);
    toJSON(): {
        id: string;
        startedAt: number;
        remoteAddress: string;
        user: string;
    };
    destroy(): void;
    unsubscribeAll(): void;
    hasSubscription(subscriptionId: number): boolean;
    handleMessage(message: string | ArrayBuffer | ArrayBuffer[] | Uint8Array): Promise<void>;
}
