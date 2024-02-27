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
import type { Dashboard, InspectorInit, SessionInit } from './types.js';
import type { MeasurementConfig, Store } from '@exotjs/measurements/types';

export class Inspector {
  static defaultDashboards(): Dashboard[] {
    return defaultDashboards;
  }

  static defaultMeasurements(): MeasurementConfig[] {
    return defaultMeasurements;
  }

  readonly env: Record<string, string> = {};

  readonly instruments: {
    errors: ErrorsInstrument;
    events: EventsInstrument;
    logs: LogsInstrument;
    metrics: MetricsInstrument;
    network: NetworkInstrument;
    traces: TracesInstrument;
  };

  readonly sessions: Set<Session> = new Set();

  readonly store: Store;

  get info() {
    const cpus = os.cpus();
    const runtime =
      (proc.title?.match(/[^\w]/) ? proc.release.name : proc.title) || 'node';
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

  constructor(init: InspectorInit = {}) {
    const {
      activate = true,
      env = true,
      instruments = {},
      store = new MemoryStore(),
    } = init;
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
      this.instruments[key as keyof typeof this.instruments].activate();
    }
  }

  deactivate() {
    for (let key in this.instruments) {
      this.instruments[key as keyof typeof this.instruments].deactivate();
    }
  }

  createSession(init?: SessionInit) {
    const session = new Session(this, init);
    this.sessions.add(session);
    session.on('destroy', () => {
      this.sessions.delete(session);
    });
    return session;
  }

  /** @deprecated */
  getInstrument(instrument: keyof typeof this.instruments) {
    if (!this.instruments[instrument]) {
      throw new Error(`Unknown instrument "${instrument}".`);
    }
    return this.instruments[instrument];
  }
}
