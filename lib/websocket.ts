import EventEmitter from "node:events";
import { Inspector } from "./inspector";

export interface WebSocketMessage<T = any> {
  error?: string;
  id?: number;
  type: 'ok' | 'error' | 'info' | 'log' | 'metrics' | 'subscribe' | 'unsubscribe';
  data?: T;
}


export class WebSocketController extends EventEmitter {
  constructor(readonly inspector: Inspector) {
    super();
  }

  #onLogsEntry = (data: [number, string]) => this.#send({
    type: 'log',
    data,
  });

  #metricsInterval?: NodeJS.Timeout;

  #metricsLastTime?: number;

  async handleMessage(message: string | ArrayBuffer | ArrayBuffer[] | Uint8Array) {
    let json;
    try {
      json = JSON.parse(String(message));
    } catch {
      // noop
    }
    if (json.type && json.id !== void 0) {
      try {
        await this.#handleMessageJson(json);
      } catch (err) {
        this.#send({
          error: String(err),
          id: json.id,
          type: 'error',
        });
      }
    } 
  }

  #send(message: WebSocketMessage) {
    this.emit('data', JSON.stringify(message));
  }

  async #handleMessageJson(message: WebSocketMessage) {
    switch (message.type) {
      case 'info':
        return this.#onInfo(message);
      case 'subscribe':
        return this.#onSubscribe(message);
      case 'unsubscribe':
        return this.#onUnubscribe(message);
      default:
        // noop
    }
  }

  async #sendMetrics() {
    this.#send({
      type: 'metrics',
      data: await this.inspector.measurements.export({
        startTime: this.#metricsLastTime,
      }),
    });
    this.#metricsLastTime = Date.now();
  }

  #onInfo(message: WebSocketMessage) {
    this.#send({
      id: message.id,
      type: 'info',
      data: {
        host: this.inspector.host,
        runtime: this.inspector.runtime,
      },
    });
  }

  #onSubscribe(message: WebSocketMessage) {
    const { interval, channel } = message.data;
    switch (channel) {
      case 'metrics':
        if (!this.#metricsInterval) {
          this.#metricsInterval = setInterval(() => {
            this.#sendMetrics();
          }, interval || 5000);
        }
        break;
      case 'logs':
        this.inspector.logs.on('entry', this.#onLogsEntry);
        break;
    }
    this.#send({
      id: message.id,
      type: 'ok',
    });
  }

  #onUnubscribe(message: WebSocketMessage) {
    switch (message.data) {
      case 'metrics':
        if (this.#metricsInterval) {
          clearInterval(this.#metricsInterval);
          this.#metricsInterval = void 0;
          this.#metricsLastTime = void 0;
        }
        break;
      case 'logs':
        this.inspector.logs.off('entry', this.#onLogsEntry);
        break;
    }
    this.#send({
      id: message.id,
      type: 'ok',
    });
  }
}