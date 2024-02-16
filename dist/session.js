import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { validate } from './helpers.js';
import { DisabledInstrumentError, InactiveInstrumentError } from './errors.js';
export class Session extends EventEmitter {
    inspector;
    id = randomBytes(6).toString('hex').toUpperCase();
    remoteAddress = '';
    startedAt = Date.now();
    user = '';
    #activatedInstruments = [];
    #subscriptions = new Map();
    #subscriptionId = 0;
    constructor(inspector, init = {}) {
        super();
        this.inspector = inspector;
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
            }
            catch {
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
            }
            catch {
                // noop
            }
        }
        this.#subscriptions.clear();
    }
    hasSubscription(subscriptionId) {
        return this.#subscriptions.has(subscriptionId);
    }
    async handleMessage(message) {
        if (typeof message === 'string') {
            let json;
            try {
                json = JSON.parse(String(message));
            }
            catch {
                // noop
            }
            if (json && json.type && json.id !== void 0) {
                let data;
                try {
                    data = await this.#onMessage(json);
                }
                catch (err) {
                    return this.#send({
                        error: err && typeof err.toJSON === 'function'
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
    }
    async #onMessage(message) {
        validate({
            type: {
                type: 'string',
            },
        }, message);
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
    async #onActivate(message) {
        validate({
            instrument: {
                type: 'string',
            },
            permanent: {
                optional: true,
                type: 'boolean',
            },
        }, message.data);
        const instrument = this.inspector.getInstrument(message.data.instrument);
        if (!instrument.active && !instrument.disabled && instrument.activate()) {
            if (message.data.permanent !== true) {
                this.#activatedInstruments.push(instrument.name);
            }
        }
        return {
            active: instrument.active,
        };
    }
    async #onDeactivate(message) {
        validate({
            instrument: {
                type: 'string',
            },
        }, message.data);
        const instrument = this.inspector.getInstrument(message.data.instrument);
        if (instrument.active && instrument.deactivate()) {
            this.#activatedInstruments = this.#activatedInstruments.filter((name) => name !== instrument.name);
        }
        return {
            active: instrument.active,
        };
    }
    async #onEnv(message) {
        return {
            env: this.inspector.env,
        };
    }
    async #onDashboards(message) {
        return this.inspector.instruments.metrics.dashboards.map(({ name, panels, templateId, templateVersion }) => {
            return {
                name,
                panels,
                templateId,
                templateVersion,
            };
        });
    }
    async #onHello(message) {
        return {
            info: this.inspector.info,
            instruments: Object.keys(this.inspector.instruments).reduce((acc, name) => {
                const instrument = this.inspector.instruments[name];
                acc[name] = {
                    active: instrument.active,
                    disabled: instrument.disabled,
                };
                return acc;
            }, {}),
            sessionId: this.id,
            sessions: [...this.inspector.sessions.values()].map((session) => {
                return session.toJSON();
            }),
        };
    }
    async #onQuery(message) {
        validate({
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
        }, message.data);
        const data = message.data;
        const instrument = this.inspector.getInstrument(data.instrument);
        if (instrument.disabled) {
            throw new DisabledInstrumentError();
        }
        return instrument.query(data.options.query);
    }
    async #onSubscribe(message) {
        validate({
            instrument: {
                type: 'string',
            },
            options: {
                type: 'object',
            },
        }, message.data);
        const data = message.data;
        const subscriptionId = (this.#subscriptionId = this.#subscriptionId + 1);
        const instrument = this.inspector.getInstrument(data.instrument);
        if (instrument.disabled) {
            throw new DisabledInstrumentError();
        }
        if (!instrument.active) {
            throw new InactiveInstrumentError();
        }
        const onEntry = (time, label, value) => {
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
    #onUnubscribe(message) {
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
    #send(message) {
        this.emit('message', JSON.stringify(message));
    }
}
