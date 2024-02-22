import os from 'node:os';
import proc from 'node:process';
import { Session } from './session.ts';
import { ErrorsInstrument } from './instruments/errors.ts';
import { EventsInstrument } from './instruments/events.ts';
import { LogsInstrument } from './instruments/logs.ts';
import { MetricsInstrument } from './instruments/metrics.ts';
import { NetworkInstrument } from './instruments/network.ts';
import { TracesInstrument } from './instruments/traces.ts';
import defaultDashboards from './default-dashboards.ts';
import defaultMeasurements from './default-measurements.ts';
import type { Dashboard, InspectorInit, SessionInit } from './types.ts';
import type { MeasurementConfig, Store } from 'npm:@exotjs/measurements@0.1.5/types';

export class Inspector {
  static defaultDashboards(): Dashboard[] {
    return defaultDashboards;
  }

  static defaultMeasurements(): MeasurementConfig[] {
    return defaultMeasurements;
  }

  env: Record<string, string> = {};

  instruments: {
    errors: ErrorsInstrument;
    events: EventsInstrument;
    logs: LogsInstrument;
    metrics: MetricsInstrument;
    network: NetworkInstrument;
    traces: TracesInstrument;
  };

  sessions: Set<Session> = new Set();

  store: Store;

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

  constructor(init: InspectorInit) {
    const { activate = true, env = true, instruments = {}, store } = init;
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

  getInstrument(instrument: keyof typeof this.instruments) {
    if (!this.instruments[instrument]) {
      throw new Error(`Unknown instrument "${instrument}".`);
    }
    return this.instruments[instrument];
  }
}
