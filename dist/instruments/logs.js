import { AsyncLocalStorage } from 'node:async_hooks';
import utils from 'node:util';
import { BaseInstrument } from './base.js';
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalConsoleDescriptors = Object.getOwnPropertyDescriptors(console);
export class LogsInstrument extends BaseInstrument {
    static CONSOLE_LEVELS = {
        assert: 'warn',
        count: 'info',
        debug: 'debug',
        dir: 'info',
        error: 'error',
        info: 'info',
        log: 'info',
        trace: 'error',
        warn: 'warn',
    };
    #als = new AsyncLocalStorage();
    #interceptors = [];
    constructor(store, init = {}) {
        const { interceptors = ['console', 'stdout'], disabled = false } = init;
        super('logs', store, disabled);
        this.#interceptors = interceptors;
    }
    async putToStore(time, label, value) {
        return this.store.listAdd(this.name, time, label, value);
    }
    async queryFromStore(query) {
        return this.store.listQuery(this.name, query.startTime, query.endTime, query.limit);
    }
    activate() {
        if (this.#interceptors.includes('stdout')) {
            this.interceptStdout();
        }
        if (this.#interceptors.includes('console')) {
            this.interceptConsole();
        }
        return super.activate();
    }
    deactivate() {
        if (this.#interceptors.includes('stdout')) {
            this.restoreStdout();
        }
        if (this.#interceptors.includes('console')) {
            this.restoreConsole();
        }
        return super.deactivate();
    }
    interceptConsole() {
        for (const method in LogsInstrument.CONSOLE_LEVELS) {
            const level = LogsInstrument.CONSOLE_LEVELS[method];
            const desc = originalConsoleDescriptors[method];
            // @ts-expect-error supress key error
            console[method] = (...args) => {
                return this.#als.run(true, () => {
                    this.push(utils.format(...args), level);
                    return desc.value(...args);
                });
            };
        }
    }
    interceptStdout() {
        // @ts-expect-error ignore argument type errors
        process.stdout.write = (chunk, encoding, cb) => {
            if (typeof chunk === 'string' && !this.#als.getStore()) {
                this.push(this.stripAnsi(chunk), 'info');
            }
            return originalStdoutWrite(chunk, encoding, cb);
        };
    }
    restoreConsole() {
        for (const method in LogsInstrument.CONSOLE_LEVELS) {
            const desc = originalConsoleDescriptors[method];
            // @ts-expect-error supress key error
            console[method] = desc.value;
        }
    }
    restoreStdout() {
        process.stdout.write = originalStdoutWrite;
    }
    stripAnsi(str) {
        return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // eslint-disable-line
        '');
    }
}
