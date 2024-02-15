import http from 'node:http';
import https from 'node:https';
import { BaseInstrument } from '../base.js';
import { getCallStack, getModulesFromCallStack, isBun } from '../helpers.js';
import type { NetworkInstrumentInit, NetworkRequest, Query } from '../types.js';
import type { Store } from '@exotjs/measurements/types';

const CONTENT_TYPE_TEXT = [
  'application/json',
  'application/xml',
  'application/xhtml+xml',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'text/html',
];

export class NetworkInstrument extends BaseInstrument {
  #fetch = globalThis.fetch;

  #httpRequest = http.request;

  #httpsRequest = https.request;

  #maxBodySize: number = 0;

  #readBody: boolean = true;

  constructor(store: Store, init: NetworkInstrumentInit = {}) {
    const {
      disabled = false,
      interceptors = ['fetch', 'http'],
      maxBodySize = 32000,
      readBody = true,
    } = init;
    super('network', store, disabled);
    this.#maxBodySize = maxBodySize;
    this.#readBody = readBody;
    if (interceptors.includes('fetch')) {
      this.interceptFetch();
    }
    if (interceptors.includes('http')) {
      this.interceptHttp();
    }
  }

  async putToStore(time: number, label: string, value: string) {
    return this.store.listAdd(this.name, time, label, value);
  }

  async queryFromStore(query: Query) {
    return this.store.listQuery(
      this.name,
      query.startTime,
      query.endTime,
      query.limit
    );
  }

  getEntryLabel(value: NetworkRequest): string {
    return value.request.method;
  }

  serializeValue(value: NetworkRequest) {
    return JSON.stringify(value);
  }

  get fetch() {
    return this.createFetch();
  }

  activate() {
    return super.activate();
  }

  deactivate() {
    return super.deactivate();
  }

  push(request: NetworkRequest) {
    if (request.request.body) {
      request.request.bodySize = request.request.body.length;
      request.request.body = this.#flattenBody(
        request.request.body,
        request.request.headers['content-type']
      );
    }
    if (request.response.body) {
      request.response.bodySize = request.response.body.length;
      request.response.body = this.#flattenBody(
        request.response.body,
        request.response.headers['content-type']
      );
    }
    return super.push(request);
  }

  async #readHttpRequestBody(
    req: http.ClientRequest,
    target: NetworkRequest['request']
  ) {
    const onChunk = (chunk: string | Buffer) => {
      if (Buffer.isBuffer(chunk)) {
        target.body = Buffer.isBuffer(target.body)
          ? Buffer.concat([target.body, chunk])
          : chunk;
      } else {
        target.body = (target.body || '') + chunk;
      }
    };
    return new Promise((resolve) => {
      const _end = req.end;
      const _write = req.write;
      req.write = (chunk: string | Buffer, ...args: [any?, any?]) => {
        onChunk(chunk);
        return _write.call(req, chunk, ...args);
      };
      req.end = (chunk?: string | Buffer | (() => void), ...args: [any?]) => {
        if (chunk && typeof chunk !== 'function') {
          onChunk(chunk);
        }
        resolve(void 0);
        return _end.call(req, chunk, ...args);
      };
    });
  }

  async #readHttpResponseBody(
    resp: http.IncomingMessage,
    target: NetworkRequest['response']
  ) {
    return new Promise((resolve) => {
      let buf = Buffer.from('');
      const _push = resp.push;
      resp.push = (chunk: Buffer | null, ...args: [any?]) => {
        if (chunk === null) {
          target.body = buf;
          resolve(void 0);
        } else {
          buf = Buffer.concat([buf, chunk]);
        }
        return _push.call(resp, chunk, ...args);
      };
    });
  }

  #flattenBody(
    body: string | Buffer,
    contentType: string | string[] = '',
    maxBodySize: number = this.#maxBodySize
  ) {
    const isText = this.#isTextContentType(String(contentType));
    if (isText) {
      if (Buffer.isBuffer(body)) {
        const len = body.length;
        if (body.length > maxBodySize) {
          return body.subarray(0, maxBodySize) + `... (+ ${len - maxBodySize})`;
        } else {
          return body.toString();
        }
      }
      if (body.length > maxBodySize) {
        return (
          body.slice(0, maxBodySize) + `... (+ ${body.length - maxBodySize})`
        );
      }
      return body;
    } else if (Buffer.isBuffer(body)) {
      return `<Binary data ${body.length}>`;
    }
    return String(body);
  }

  #isTextContentType(contentType: string) {
    const [type] = contentType.split(';');
    return CONTENT_TYPE_TEXT.includes(type.toLowerCase());
  }

  createFetch(fetchFn = this.#fetch) {
    const self = this;
    return async function fetchInterceptor(
      input: RequestInfo | URL,
      init?: RequestInit
    ) {
      if (!self.active) {
        return fetchFn(input, init);
      }
      const stack = getCallStack();
      const start = performance.now();
      const request: NetworkRequest = {
        duration: 0,
        initiator: 'fetch',
        modules: getModulesFromCallStack(stack),
        request: {
          bodySize: 0,
          headers: {},
          method: '',
          url: '',
        },
        response: {
          bodySize: 0,
          headers: {},
          status: 0,
        },
        stack,
        start: Math.floor((performance.timeOrigin + start) * 100) / 100,
      };
      if (!(input instanceof Request)) {
        input = new Request(input, init);
      }
      if (self.#readBody && input.method !== 'GET') {
        request.request.body = Buffer.from(await input.clone().arrayBuffer());
      }
      request.request.headers = Object.fromEntries(input.headers);
      request.request.method = input.method;
      request.request.url = input.url;
      let resp: Response | undefined = void 0;
      try {
        resp = await fetchFn(input, init);
      } catch (err: any) {
        request.error = String(err);
        throw err;
      } finally {
        request.duration = Math.floor((performance.now() - start) * 100) / 100;
        if (resp) {
          if (self.#readBody) {
            const clone = resp.clone();
            request.response.body = Buffer.from(await clone.arrayBuffer());
          }
          request.response.headers = Object.fromEntries(resp.headers);
          request.response.status = resp.status;
        }
        self.push(request);
      }
      return resp;
    };
  }

  interceptFetch() {
    globalThis.fetch = this.createFetch(this.#fetch);
  }

  interceptHttp() {
    const self = this;
    const createInterceptor = (
      makeRequest: typeof http.request,
      initiator: string
    ) => {
      return function httpInterceptor(...args: [any?]) {
        if (!self.active) {
          return makeRequest(...args);
        }
        const stack = getCallStack();
        const start = performance.now();
        const request: NetworkRequest = {
          duration: 0,
          initiator,
          modules: getModulesFromCallStack(stack),
          request: {
            bodySize: 0,
            headers: {},
            method: '',
            url: '',
          },
          response: {
            bodySize: 0,
            headers: {},
            status: 0,
          },
          stack,
          start: Math.floor((performance.timeOrigin + start) * 100) / 100,
        };
        const req = makeRequest(...args);
        if (self.#readBody) {
          self.#readHttpRequestBody(req, request.request);
        }
        req.on('response', (resp) => {
          request.duration =
            Math.floor((performance.now() - start) * 100) / 100;
          request.response.headers = { ...(resp.headers as object) };
          request.response.status = resp.statusCode || 0;
          if (self.#readBody) {
            self.#readHttpResponseBody(resp, request.response).then(() => {
              self.push(request);
            });
          } else {
            self.push(request);
          }
        });
        request.request.headers = {
          ...(req.getHeaders() as typeof request.request.headers),
        };
        request.request.method = req.method;
        request.request.url = req.protocol + '//' + req.host + req.path;
        return req;
      };
    };
    if (!isBun()) {
      // Intercepting https in Bun leads to double capture of requests
      https.request = createInterceptor(self.#httpsRequest, 'https');
    }
    http.request = createInterceptor(self.#httpRequest, 'http');
  }

  restoreFetch() {
    globalThis.fetch = this.#fetch;
  }

  restoreHttp() {
    https.request = this.#httpsRequest;
    http.request = this.#httpRequest;
  }
}
