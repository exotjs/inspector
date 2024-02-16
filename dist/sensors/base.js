import { EventEmitter } from 'node:events';
export class SensorBase extends EventEmitter {
    name;
    inverval;
    #sampleInterval;
    constructor(name, inverval = 5000) {
        super();
        this.name = name;
        this.inverval = inverval;
        this.#sampleInterval = setInterval(() => {
            this.sample()
                .then((value) => {
                this.emit('sample', value);
            })
                .catch(() => {
                // TODO:
            });
        }, this.inverval);
    }
    destroy() {
        if (this.#sampleInterval) {
            clearInterval(this.#sampleInterval);
        }
        this.removeAllListeners();
    }
}
