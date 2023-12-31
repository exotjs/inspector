import EventEmitter from 'node:events';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);

export interface LogsInit {
  maxEntries: number;
}

export class Logs extends EventEmitter {
  init: LogsInit;

  logs: [number, string][] = [];

  constructor(init: Partial<LogsInit>) {
    super();
    const {
      maxEntries = 1000,
    } = init;
    this.init = {
      maxEntries,
    };
  }

  mountStdout() { 
    // @ts-expect-error
    process.stdout.write = (chunk, encoding, cb) => {
      if (typeof chunk === 'string') {
        this.push(chunk);
      }
      return originalStdoutWrite(chunk, encoding, cb);
    };
  }

  unmountStdout() {
    process.stdout.write = originalStdoutWrite;
  }

  push(log: string) {
    const entry = [Date.now(), log];
    this.logs.push(entry as [number, string]);
    if (this.logs.length > this.init.maxEntries) {
      this.logs.shift();
    }
    this.emit('entry', entry);
  }
}