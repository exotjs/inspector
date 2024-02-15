import { BaseInstrument } from '../base.js';
import { getModulesFromCallStack } from '../helpers.js';
export class ErrorsInstrument extends BaseInstrument {
    constructor(store, init = {}) {
        const { disabled = false } = init;
        super('errors', store, disabled);
    }
    async putToStore(time, label, value) {
        return this.store.listAdd(this.name, time, label, value);
    }
    async queryFromStore(query) {
        return this.store.listQuery(this.name, query.startTime, query.endTime, query.limit);
    }
    getEntryLabel(value) {
        return value.server === false ? 'client' : 'server';
    }
    serializeValue(value) {
        if (value instanceof Error) {
            value = {
                message: String(value.message),
                stack: value.stack,
            };
        }
        if (value.modules === void 0 && value.stack) {
            value.modules = getModulesFromCallStack(value.stack?.split('\n') || []);
        }
        return JSON.stringify(value);
    }
}
