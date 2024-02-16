/// <reference types="node" />
import { EventEmitter } from 'node:events';
export declare abstract class SensorBase extends EventEmitter {
    #private;
    name: string;
    inverval: number;
    constructor(name: string, inverval?: number);
    destroy(): void;
    abstract sample(): Promise<number>;
}
