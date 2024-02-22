import { MeasurementConfig } from 'npm:@exotjs/measurements@0.1.5/types';

export default [
  {
    interval: 10000,
    key: 'cpu',
    sensor: 'cpu',
    type: 'aggregate',
  },
  {
    interval: 10000,
    key: 'memory:rss',
    sensor: 'memory-rss',
    type: 'aggregate',
  },
  {
    interval: 10000,
    key: 'memory:heap',
    sensor: 'memory-heap',
    type: 'aggregate',
  },
  {
    interval: 10000,
    key: 'eventloop',
    sensor: 'event-loop-delay',
    type: 'aggregate',
  },
  {
    interval: 10000,
    key: 'response:1xx',
    type: 'sum',
  },
  {
    interval: 10000,
    key: 'response:2xx',
    type: 'sum',
  },
  {
    interval: 10000,
    key: 'response:3xx',
    type: 'sum',
  },
  {
    interval: 10000,
    key: 'response:4xx',
    type: 'sum',
  },
  {
    interval: 10000,
    key: 'response:5xx',
    type: 'sum',
  },
  {
    interval: 10000,
    key: 'response:latency',
    type: 'aggregate',
  },
] satisfies MeasurementConfig[];
