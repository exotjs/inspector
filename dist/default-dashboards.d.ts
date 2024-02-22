declare const _default: {
    templateId: string;
    templateVersion: number;
    name: string;
    panels: ({
        colspan: number;
        legend: {
            'response:1xx': string;
            'response:2xx': string;
            'response:3xx': string;
            'response:4xx': string;
            'response:5xx': string;
            'response:latency'?: undefined;
            cpu?: undefined;
            'memory:heap'?: undefined;
            'memory:rss'?: undefined;
            eventloop?: undefined;
        };
        title: string;
        measurements: string[];
        minValue: number;
        type: string;
        height: string;
        colors: {
            'response:1xx': string;
            'response:2xx': string;
            'response:3xx': string;
            'response:4xx': string;
            'response:5xx': string;
        };
        format?: undefined;
        maxValue?: undefined;
    } | {
        colspan: number;
        legend: {
            'response:latency': string;
            'response:1xx'?: undefined;
            'response:2xx'?: undefined;
            'response:3xx'?: undefined;
            'response:4xx'?: undefined;
            'response:5xx'?: undefined;
            cpu?: undefined;
            'memory:heap'?: undefined;
            'memory:rss'?: undefined;
            eventloop?: undefined;
        };
        title: string;
        measurements: string[];
        minValue: number;
        format: string;
        type: string;
        height: string;
        colors?: undefined;
        maxValue?: undefined;
    } | {
        colspan: number;
        legend: {
            cpu: string;
            'response:1xx'?: undefined;
            'response:2xx'?: undefined;
            'response:3xx'?: undefined;
            'response:4xx'?: undefined;
            'response:5xx'?: undefined;
            'response:latency'?: undefined;
            'memory:heap'?: undefined;
            'memory:rss'?: undefined;
            eventloop?: undefined;
        };
        title: string;
        measurements: string[];
        type: string;
        format: string;
        height: string;
        minValue: number;
        maxValue: number;
        colors?: undefined;
    } | {
        colspan: number;
        legend: {
            'memory:heap': string;
            'memory:rss': string;
            'response:1xx'?: undefined;
            'response:2xx'?: undefined;
            'response:3xx'?: undefined;
            'response:4xx'?: undefined;
            'response:5xx'?: undefined;
            'response:latency'?: undefined;
            cpu?: undefined;
            eventloop?: undefined;
        };
        title: string;
        measurements: string[];
        minValue: number;
        format: string;
        type: string;
        height: string;
        colors?: undefined;
        maxValue?: undefined;
    } | {
        colspan: number;
        legend: {
            eventloop: string;
            'response:1xx'?: undefined;
            'response:2xx'?: undefined;
            'response:3xx'?: undefined;
            'response:4xx'?: undefined;
            'response:5xx'?: undefined;
            'response:latency'?: undefined;
            cpu?: undefined;
            'memory:heap'?: undefined;
            'memory:rss'?: undefined;
        };
        title: string;
        measurements: string[];
        minValue: number;
        format: string;
        type: string;
        height: string;
        colors?: undefined;
        maxValue?: undefined;
    })[];
}[];
export default _default;
