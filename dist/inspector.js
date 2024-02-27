import os from 'node:os';
import proc from 'node:process';
import { Session } from './session.js';
import { ErrorsInstrument } from './instruments/errors.js';
import { EventsInstrument } from './instruments/events.js';
import { LogsInstrument } from './instruments/logs.js';
import { MetricsInstrument } from './instruments/metrics.js';
import { NetworkInstrument } from './instruments/network.js';
import { TracesInstrument } from './instruments/traces.js';
import { MemoryStore } from './store.js';
import defaultDashboards from './default-dashboards.js';
import defaultMeasurements from './default-measurements.js';
export class Inspector {
    static defaultDashboards() {
        return defaultDashboards;
    }
    static defaultMeasurements() {
        return defaultMeasurements;
    }
    env = {};
    instruments;
    sessions = new Set();
    store;
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
    constructor(init = {}) {
        const { activate = true, env = true, instruments = {}, store = new MemoryStore(), } = init;
        this.store = store;
        this.instruments = {
            errors: new ErrorsInstrument(store, instruments.errors),
            events: new EventsInstrument(store, instruments.events),
            logs: new LogsInstrument(store, instruments.logs),
            metrics: new MetricsInstrument(store, instruments.metrics),
            network: new NetworkInstrument(store, instruments.network),
            traces: new TracesInstrument(store, instruments.traces),
        };
        if (env) {
            Object.assign(this.env, proc.env);
        }
        if (activate) {
            this.activate();
        }
    }
    destroy() {
        for (const session of this.sessions) {
            session.destroy();
        }
        this.deactivate();
        this.store.destroy();
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
    createSession(init) {
        const session = new Session(this, init);
        this.sessions.add(session);
        session.on('destroy', () => {
            this.sessions.delete(session);
        });
        return session;
    }
    /** @deprecated */
    getInstrument(instrument) {
        if (!this.instruments[instrument]) {
            throw new Error(`Unknown instrument "${instrument}".`);
        }
        return this.instruments[instrument];
    }
}
