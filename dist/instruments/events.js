import { BaseInstrument } from '../base.js';
export class EventsInstrument extends BaseInstrument {
    constructor(store, init = {}) {
        const { disabled = false } = init;
        super('events', store, disabled);
    }
    async putToStore(time, label, value) {
        return this.store.listAdd(this.name, time, label, value);
    }
    async queryFromStore(query) {
        return this.store.listQuery(this.name, query.startTime, query.endTime, query.limit);
    }
    getEntryLabel(_value) {
        return '';
    }
    serializeValue(value) {
        return JSON.stringify(value);
    }
}
