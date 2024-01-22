import { BaseInstrument } from '../base.js';
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
export class LogsInstrument extends BaseInstrument {
    constructor(store, init = {}) {
        const { disabled = false } = init;
        super('logs', store, disabled);
    }
    activate() {
        this.mountStdout();
        return super.activate();
    }
    deactivate() {
        this.unmountStdout();
        return super.deactivate();
    }
    mountStdout() {
        // @ts-expect-error
        process.stdout.write = (chunk, encoding, cb) => {
            if (typeof chunk === 'string') {
                this.push(this.stripAnsi(chunk), 'info');
            }
            return originalStdoutWrite(chunk, encoding, cb);
        };
    }
    unmountStdout() {
        process.stdout.write = originalStdoutWrite;
    }
    stripAnsi(str) {
        return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    }
}
