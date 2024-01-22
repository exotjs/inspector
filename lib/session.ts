import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { Inspector } from './inspector.js';
import { validate } from './helpers.js';
import { DisabledInstrumentError, InactiveInstrumentError } from './errors.js';
import type { SessionInit, WebSocketMessage } from './types.js';

export class Session extends EventEmitter {
  id: string = randomBytes(6).toString('hex').toUpperCase();

  remoteAddress: string = '';

  startedAt: number = Date.now();

  user: string = '';

  #activatedInstruments: (keyof Inspector['instruments'])[] = [];

  #subscriptions: Map<
    number,
    { instrument: keyof Inspector['instruments']; unsubscribe: () => void }
  > = new Map();

  #subscriptionId: number = 0;

  constructor(
    readonly inspector: Inspector,
    init: SessionInit = {},
  ) {
    super();
    this.remoteAddress = init.remoteAddress || '';
    this.user = init.user || '';
  }

  toJSON() {
    return {
      id: this.id,
      startedAt: this.startedAt,
      remoteAddress: this.remoteAddress,
      user: this.user,
    };
  }

  destroy() {
    for (let instrument of this.#activatedInstruments) {
      try {
        this.inspector.getInstrument(instrument).deactivate();
      } catch {
        // noop
      }
    }
    this.emit('destroy');
  }

  unsubscribeAll() {
    for (let [_, { instrument, unsubscribe }] of this.#subscriptions) {
      try {
        unsubscribe();
        if (this.#activatedInstruments.includes(instrument)) {
          this.inspector.getInstrument(instrument).deactivate();
        }
      } catch {
        // noop
      }
    }
    this.#subscriptions.clear();
  }

  async handleMessage(
    message: string | ArrayBuffer | ArrayBuffer[] | Uint8Array,
  ) {
    let json;
    try {
      json = JSON.parse(String(message));
    } catch {
      // noop
    }
    if (json.type && json.id !== void 0) {
      let data: any;
      try {
        data = await this.#onMessage(json);
      } catch (err: any) {
        return this.#send({
          error:
            err && typeof err.toJSON === 'function'
              ? err.toJSON()
              : { message: String(err) },
          id: json.id,
          type: 'error',
        });
      }
      this.#send({
        data,
        id: json.id,
        type: 'ok',
      });
    }
  }

  async #onMessage(message: WebSocketMessage) {
    validate(
      {
        type: {
          type: 'string',
        },
      },
      message,
    );
    switch (message.type) {
      case 'activate':
        return this.#onActivate(message);
      case 'dashboards':
        return this.#onDashboards(message);
      case 'deactivate':
        return this.#onDeactivate(message);
      case 'env':
        return this.#onEnv(message);
      case 'hello':
        return this.#onHello(message);
      case 'query':
        return this.#onQuery(message);
      case 'subscribe':
        return this.#onSubscribe(message);
      case 'unsubscribe':
        return this.#onUnubscribe(message);
      default:
      // noop
    }
  }

  async #onActivate(message: WebSocketMessage) {
    validate(
      {
        instrument: {
          type: 'string',
        },
        permanent: {
          optional: true,
          type: 'boolean',
        },
      },
      message.data,
    );
    const instrument = this.inspector.getInstrument(message.data.instrument);
    if (!instrument.active && instrument.activate()) {
      if (message.data.permanent !== true) {
        this.#activatedInstruments.push(
          instrument.name as keyof Inspector['instruments'],
        );
      }
    }
    return {
      active: instrument.active,
    };
  }

  async #onDeactivate(message: WebSocketMessage) {
    validate(
      {
        instrument: {
          type: 'string',
        },
      },
      message.data,
    );
    const instrument = this.inspector.getInstrument(message.data.instrument);
    if (instrument.active && (await instrument.deactivate())) {
      this.#activatedInstruments = this.#activatedInstruments.filter(
        (name) => name !== instrument.name,
      );
    }
    return {
      active: instrument.active,
    };
  }

  async #onEnv(message: WebSocketMessage) {
    return {
      env: this.inspector.env,
    };
  }

  async #onDashboards(message: WebSocketMessage) {
    return this.inspector.instruments.measurements.dashboards.map(
      ({ name, panels, templateId, templateVersion }) => {
        return {
          name,
          panels,
          templateId,
          templateVersion,
        };
      },
    );
  }

  async #onHello(message: WebSocketMessage) {
    return {
      info: this.inspector.info,
      instruments: Object.keys(this.inspector.instruments).reduce(
        (acc, name) => {
          acc[name] = {
            active:
              this.inspector.instruments[name as keyof Inspector['instruments']]
                .active,
          };
          return acc;
        },
        {} as Record<string, { active: boolean }>,
      ),
      sessionId: this.id,
      sessions: [...this.inspector.sessions.values()].map((session) => {
        return session.toJSON();
      }),
    };
  }

  async #onQuery(message: WebSocketMessage) {
    validate(
      {
        instrument: {
          type: 'string',
        },
        options: {
          properties: {
            query: {
              properties: {
                endTime: {
                  optional: true,
                  type: 'number',
                },
                limit: {
                  optional: true,
                  type: 'number',
                },
                startTime: {
                  type: 'number',
                },
              },
              type: 'object',
            },
          },
          type: 'object',
        },
      },
      message.data,
    );
    const data = message.data;
    const instrument = this.inspector.getInstrument(data.instrument);
    if (instrument.disabled) {
      throw new DisabledInstrumentError();
    }
    return instrument.query(this.inspector.store, data.options.query);
  }

  async #onSubscribe(message: WebSocketMessage) {
    validate(
      {
        instrument: {
          type: 'string',
        },
        options: {
          type: 'object',
        },
      },
      message.data,
    );
    const data = message.data;
    const subscriptionId = (this.#subscriptionId = this.#subscriptionId + 1);
    const instrument = this.inspector.getInstrument(data.instrument);
    if (instrument.disabled) {
      throw new DisabledInstrumentError();
    }
    if (!instrument.active) {
      throw new InactiveInstrumentError();
    }
    const onEntry = (time: number, label: string, value: any) => {
      return this.#send({
        type: 'data',
        data: [time, label, value],
        subscriptionId,
      });
    };
    this.#subscriptions.set(subscriptionId, {
      instrument: instrument.name,
      unsubscribe: instrument.subscribe(onEntry, data.options),
    });
    return {
      subscriptionId,
    };
  }

  #onUnubscribe(message: WebSocketMessage) {
    const { subscriptionId } = message.data;
    const sub = this.#subscriptions.get(subscriptionId);
    if (sub) {
      sub.unsubscribe();
      this.#subscriptions.delete(subscriptionId);
      if (this.#activatedInstruments.includes(sub.instrument)) {
        this.inspector.getInstrument(sub.instrument).deactivate();
      }
    }
  }

  #send(message: WebSocketMessage) {
    this.emit('message', JSON.stringify(message));
  }
}
