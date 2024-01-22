import { BaseInstrument } from '../base.js';
import { getModulesFromCallStack } from '../helpers.js';
export class ErrorsInstrument extends BaseInstrument {
    constructor(store, init = {}) {
        const { disabled = false } = init;
        super('errors', store, disabled);
    }
    getEntryLabel(value) {
        return value.server === false ? 'client' : 'server';
    }
    serializeValue(value) {
        if (value instanceof Error) {
            value = {
                message: String(value.message),
                modules: getModulesFromCallStack(value.stack?.split('\n') || []),
                stack: value.stack,
            };
        }
        return JSON.stringify(value);
    }
}
