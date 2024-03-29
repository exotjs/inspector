import { EventEmitter } from 'node:events';
export class BaseInstrument extends EventEmitter {
    name;
    store;
    active = false;
    disabled = false;
    constructor(name, store, disabled = false) {
        super();
        this.name = name;
        this.store = store;
        this.disabled = disabled;
        if (!this.disabled) {
            this.active = true;
        }
    }
    getEntryLabel(_value) {
        return '';
    }
    getEntryTime(_value) {
        return Date.now();
    }
    serializeValue(value) {
        return value;
    }
    activate() {
        if (!this.disabled) {
            this.active = true;
        }
        return this.active;
    }
    deactivate() {
        this.active = false;
        return !this.active;
    }
    async push(value, label = this.getEntryLabel(value), time = this.getEntryTime(value)) {
        if (this.active) {
            const serialized = this.serializeValue(value);
            await this.putToStore(time, label, serialized);
            this.emit('push', time, label, serialized);
        }
    }
    async query(query) {
        return this.queryFromStore(query);
    }
    async putToStore(time, label, value) {
        return this.store.setAdd(this.name, time, label, value);
    }
    async queryFromStore(query) {
        return this.store.setQuery(this.name, query.startTime, query.endTime, query.limit);
    }
    subscribe(fn, _options) {
        this.on('push', fn);
        return () => {
            this.off('push', fn);
        };
    }
}
