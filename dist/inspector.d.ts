/// <reference types="node" />
import { Session } from './session.js';
import { ErrorsInstrument } from './instruments/errors.js';
import { EventsInstrument } from './instruments/events.js';
import { LogsInstrument } from './instruments/logs.js';
import { MetricsInstrument } from './instruments/metrics.js';
import { NetworkInstrument } from './instruments/network.js';
import { TracesInstrument } from './instruments/traces.js';
import type { Dashboard, InspectorInit, SessionInit } from './types.js';
import type { MeasurementConfig, Store } from '@exotjs/measurements/types';
export declare class Inspector {
    static defaultDashboards(): Dashboard[];
    static defaultMeasurements(): MeasurementConfig[];
    env: Record<string, string>;
    instruments: {
        errors: ErrorsInstrument;
        events: EventsInstrument;
        logs: LogsInstrument;
        metrics: MetricsInstrument;
        network: NetworkInstrument;
        traces: TracesInstrument;
    };
    sessions: Set<Session>;
    store: Store;
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
    destroy(): void;
    activate(): void;
    deactivate(): void;
    createSession(init?: SessionInit): Session;
    getInstrument(instrument: keyof typeof this.instruments): ErrorsInstrument | EventsInstrument | LogsInstrument | MetricsInstrument | NetworkInstrument | TracesInstrument;
}
