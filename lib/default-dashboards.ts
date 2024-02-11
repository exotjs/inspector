import type { Dashboard } from './types.js';

export default [
  {
    templateId: 'monitoring',
    templateVersion: 1,
    name: 'Monitoring',
    measurements: [
      {
        interval: 10000,
        key: 'cpu',
        sensor: 'cpu',
      },
      {
        interval: 10000,
        key: 'memory:rss',
        sensor: 'memory-rss',
      },
      {
        interval: 10000,
        key: 'memory:heap',
        sensor: 'memory-heap',
      },
      {
        interval: 10000,
        key: 'eventloop',
        sensor: 'event-loop-delay',
      },
      {
        key: 'response:1xx',
        type: 'sum',
      },
      {
        key: 'response:2xx',
        type: 'sum',
      },
      {
        key: 'response:3xx',
        type: 'sum',
      },
      {
        key: 'response:4xx',
        type: 'sum',
      },
      {
        key: 'response:5xx',
        type: 'sum',
      },
      {
        key: 'response:latency',
        type: 'aggregate',
      },
    ],
    panels: [
      {
        colspan: 6,
        legend: {
          'response:1xx': '1xx',
          'response:2xx': '2xx',
          'response:3xx': '3xx',
          'response:4xx': '4xx',
          'response:5xx': '5xx',
        },
        title: 'Responses',
        measurements: [
          'response:1xx',
          'response:2xx',
          'response:3xx',
          'response:4xx',
          'response:5xx',
        ],
        minValue: 0,
        type: 'bar',
        height: '300px',
        colors: {
          'response:1xx': '#91abbc',
          'response:2xx': '#77a5a7',
          'response:3xx': '#f4f4d5',
          'response:4xx': '#ffbdb3',
          'response:5xx': '#cf3759',
        },
      },
      {
        colspan: 6,
        legend: {
          'response:latency': 'Latency',
        },
        title: 'Response time',
        measurements: ['response:latency.avg'],
        minValue: 0,
        format: 'msec',
        type: 'bar',
        height: '300px',
      },
      {
        colspan: 4,
        legend: {
          cpu: 'CPU',
        },
        title: 'CPU',
        measurements: ['cpu.avg'],
        type: 'area',
        format: 'percent',
        height: '300px',
        minValue: 0,
        maxValue: 1,
      },
      {
        colspan: 4,
        legend: {
          'memory:heap': 'Heap',
          'memory:rss': 'RSS',
        },
        title: 'Memory',
        measurements: ['memory:heap.avg', 'memory:rss.avg'],
        minValue: 0,
        format: 'bytes',
        type: 'area',
        height: '300px',
      },
      {
        colspan: 4,
        legend: {
          eventloop: 'Delay',
        },
        title: 'Event Loop Delay',
        measurements: ['eventloop'],
        minValue: 0,
        format: 'msec',
        type: 'area',
        height: '300px',
      },
    ],
  },
] satisfies Dashboard[];
