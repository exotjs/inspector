import os from 'node:os';
import proc from 'node:process';
import { Session } from './session.js';
import { ErrorsInstrument } from './instruments/errors.js';
import { LogsInstrument } from './instruments/logs.js';
import { MeasurementsInstrument } from './instruments/measurements.js';
import { NetworkInstrument } from './instruments/network.js';
import { TracesInstrument } from './instruments/traces.js';
import defaultDashboards from './default-dashboards.js';
export class Inspector {
    static defaultDashboards() {
        return defaultDashboards;
    }
    instruments;
    sessions = new Set();
    store;
    get env() {
        return {
            ...proc.env,
        };
    }
    get info() {
        const cpus = os.cpus();
        const runtime = (proc.title?.match(/[^\w]/) ? proc.release.name : proc.title) || 'node';
        return {
            apiVersion: '0.0.0',
            arch: os.arch(),
            cpus: cpus.length,
            cpuModel: cpus[0]?.model || '',
            hostname: os.hostname(),
            memory: os.totalmem(),
            platform: os.platform(),
            runtime,
            runtimeVersion: proc.versions[runtime] || proc.version,
            startedAt: performance.timeOrigin,
        };
    }
    constructor(init) {
        const { instruments = {}, store } = init;
        this.store = store;
        this.instruments = {
            errors: new ErrorsInstrument(store, instruments.errors),
            logs: new LogsInstrument(store, instruments.logs),
            measurements: new MeasurementsInstrument(store, instruments.measurements),
            network: new NetworkInstrument(store, instruments.network),
            traces: new TracesInstrument(store, instruments.traces),
        };
    }
    activate() {
        for (let key in this.instruments) {
            this.instruments[key].activate();
        }
    }
    deactivate() {
        for (let key in this.instruments) {
            this.instruments[key].deactivate();
        }
    }
    createSessions(init) {
        const session = new Session(this, init);
        this.sessions.add(session);
        session.on('destroy', () => {
            this.sessions.delete(session);
        });
        return session;
    }
    getInstrument(instrument) {
        if (!this.instruments[instrument]) {
            throw new Error(`Unknown instrument ${instrument}.`);
        }
        return this.instruments[instrument];
    }
}