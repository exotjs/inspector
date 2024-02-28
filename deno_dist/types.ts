import { Buffer } from "node:buffer";
import type { Store, MeasurementConfig } from 'npm:@exotjs/measurements@0.1.5/types';

export * from 'npm:@exotjs/trace@0.1.6/types';

export interface MeasurementsInit {
  measurements: MeasurementConfig[];
}

export interface Query {
  endTime: number;
  limit?: number;
  startTime: number;
}

export interface QueryMeasurements {
  endTime: number;
  keys: string[];
  startTime: number;
}

export interface SubscriptionOptions {
  endTime: number;
  interval: number;
  keys: string[];
  startTime: number;
}

export interface TrackResponse {
  duration: number;
  status: number;
}

export interface ErrorObject {
  message: string;
  stack: string;
}

export interface NetworkRequest {
  duration: number;
  error?: string;
  initiator: string;
  modules: string[];
  request: {
    body?: string | Buffer;
    bodySize: number;
    headers: Record<string, string | string[]>;
    method: string;
    url: string;
  };
  response: {
    body?: string | Buffer;
    bodySize: number;
    headers: Record<string, string | string[]>;
    status: number;
  };
  stack: string[];
  start: number;
}

export interface WebSocketMessage<T = any> {
  error?: string;
  id?: number;
  type:
    | 'ok'
    | 'error'
    | 'data'
    | 'hello'
    | 'dashboards'
    | 'env'
    | 'activate'
    | 'deactivate'
    | 'query'
    | 'subscribe'
    | 'unsubscribe';
  data?: T;
  subscriptionId?: number;
}

export interface ValidationSchema {
  optional?: boolean;
  properties?: Record<string, ValidationSchema>;
  type: 'array' | 'object' | 'number' | 'string' | 'boolean';
}

export interface DashboardPanel {
  children?: DashboardPanel[];
  colspan?: number;
  colors?: Record<string, string>;
  data?: any[];
  format?: string;
  height?: string;
  legend?: boolean | Record<string, string | undefined>;
  maxValue?: number;
  maxPoints?: number;
  measurements?: string[];
  minValue?: number;
  text?: string;
  title?: string;
  type: string;
  thresholds?: [number, string?][];
  value?: string;
}

export interface SessionInit {
  remoteAddress?: string;
  user?: string;
}

export type InspectorInstruments =
  | 'errors'
  | 'events'
  | 'logs'
  | 'metrics'
  | 'network'
  | 'traces';

export interface Dashboard {
  name: string;
  panels: DashboardPanel[];
  templateId: string;
  templateVersion: number;
}

export interface BaseInstrumentInit {
  disabled?: boolean;
}

export interface LogsInstrumentInit extends BaseInstrumentInit {
  interceptors?: Array<'console' | 'stdout'>;
}

export interface MetricsInstrumentInit extends BaseInstrumentInit {
  dashboards?: Dashboard[];
  measurements?: MeasurementConfig[];
}

export interface NetworkInstrumentInit extends BaseInstrumentInit {
  interceptors?: Array<'http' | 'fetch'>;
  maxBodySize?: number;
  readBody?: boolean;
}

export interface InspectorInitInstruments {
  errors?: BaseInstrumentInit;
  events?: BaseInstrumentInit;
  logs?: LogsInstrumentInit;
  metrics?: MetricsInstrumentInit;
  network?: NetworkInstrumentInit;
  traces?: BaseInstrumentInit;
}

export interface InspectorInit {
  activate?: boolean;
  env?: boolean;
  instruments?: InspectorInitInstruments;
  store?: Store;
}

export interface ErrorsInstrumentValue {
  attributes?: Record<string, any>;
  error?: any;
  message?: string;
  modules?: string[];
  stack?: string;
}

export interface EventsInstrumentValue {
  attributes?: Record<string, any>;
  name: string;
}
