import { EventEmitter } from 'node:events';

export abstract class SensorBase extends EventEmitter {
  #sampleInterval: number | NodeJS.Timeout;

  constructor(
    public name: string,
    public inverval: number = 5000
  ) {
    super();
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

  abstract sample(): Promise<number>;
}
