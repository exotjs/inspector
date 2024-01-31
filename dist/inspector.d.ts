/// <reference types="node" />
import { Session } from './session.js';
import { ErrorsInstrument } from './instruments/errors.js';
import { LogsInstrument } from './instruments/logs.js';
import { MeasurementsInstrument } from './instruments/measurements.js';
import { NetworkInstrument } from './instruments/network.js';
import { TracesInstrument } from './instruments/traces.js';
import type { Dashboard, InspectorInit, SessionInit } from './types.js';
import type { Store } from '@exotjs/measurements/types';
export declare class Inspector {
    static defaultDashboards(): Dashboard[];
    instruments: {
        errors: ErrorsInstrument;
        logs: LogsInstrument;
        measurements: MeasurementsInstrument;
        network: NetworkInstrument;
        traces: TracesInstrument;
    };
    sessions: Set<Session>;
    store: Store;
    get env(): {
        [x: string]: string | undefined;
        TZ?: string | undefined;
    };
    get info(): {
        apiVersion: string;
        arch: string;
        cpus: number;
        cpuModel: string;
        hostname: string;
        memory: number;
        platform: NodeJS.Platform;
        runtime: string;
        runtimeVersion: string;
        startedAt: number;
    };
    constructor(init: InspectorInit);
    activate(): void;
    deactivate(): void;
    createSessions(init?: SessionInit): Session;
    getInstrument(instrument: keyof typeof this.instruments): TracesInstrument | ErrorsInstrument | LogsInstrument | MeasurementsInstrument | NetworkInstrument;
}
