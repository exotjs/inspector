import { BaseInstrument } from '../base.js';
import { Tracer } from '@exotjs/trace';
export class TracesInstrument extends BaseInstrument {
    tracer;
    constructor(store, init = {}) {
        const { disabled = false } = init;
        super('traces', store, disabled);
        this.tracer = new Tracer();
        this.tracer.on('endSpan', (span) => {
            if (!span.parent) {
                this.push(span);
            }
        });
    }
    get endSpan() {
        return this.tracer.endSpan;
    }
    get startSpan() {
        return this.tracer.startSpan;
    }
    get trace() {
        return this.tracer.trace;
    }
    async putToStore(time, label, value) {
        return this.store.listAdd(this.name, time, label, value);
    }
    async queryFromStore(query) {
        return this.store.listQuery(this.name, query.startTime, query.endTime, query.limit);
    }
    getEntryLabel(value) {
        return String(value.attributes?.label || '');
    }
    getEntryTime(entry) {
        return Math.floor(entry.start);
    }
    serializeValue(value) {
        return JSON.stringify(value);
    }
}
