import type { Store, MeasurementConfig } from '@exotjs/measurements/types';

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

export interface TraceSpan {
  attributes?: Record<string, any>;
  end: () => Omit<TraceSpan, 'end'>;
  description?: string;
  duration: number;
  label?: string;
  name: string;
  parent?: TraceSpan;
  start: number;
  traceId?: string;
  traces?: TraceSpan[];
}

export interface ErrorObject {
  message: string;
  stack: string;
}

export type TraceSpanOptions = Pick<
  TraceSpan,
  'attributes' | 'label' | 'name' | 'description' | 'traceId'
> & { start?: number; parent?: TraceSpan };

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
  legend?: boolean | Record<string, string>;
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
  | 'logs'
  | 'measurements'
  | 'network'
  | 'traces';

export interface Dashboard {
  measurements: {
    interval?: number;
    key: string;
    sensor?: string;
    type?: MeasurementConfig['type'];
  }[];
  name: string;
  panels: DashboardPanel[];
  templateId: string;
  templateVersion: number;
}

export interface BaseInstrumentInit {
  disabled?: boolean;
}

export interface MeasurementsInstrumentInit extends BaseInstrumentInit {
  dashboards?: Dashboard[];
}

export interface NetworkInstrumentInit extends BaseInstrumentInit {
  interceptors?: Array<'http' | 'fetch'>;
  maxBodySize?: number;
  readBody?: boolean;
}

export interface InspectorInitInstruments {
  errors?: BaseInstrumentInit;
  logs?: BaseInstrumentInit;
  measurements?: MeasurementsInstrumentInit;
  network?: NetworkInstrumentInit;
  traces?: BaseInstrumentInit;
}

export interface InspectorInit {
  instruments?: InspectorInitInstruments;
  store: Store;
}

export interface ErrorsInstrumentValue {
  message: string;
  modules?: string[];
  server?: boolean;
  stack: string;
}
