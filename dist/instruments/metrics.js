import { Measurements } from '@exotjs/measurements';
import { BaseInstrument } from '../base.js';
import { MemoryRssSensor } from '../sensors/memory-rss.js';
import { MemoryHeapSensor } from '../sensors/memory-heap.js';
import { EventLoopDelaySensor } from '../sensors/event-loop-delay.js';
import { CpuSensor } from '../sensors/cpu.js';
import { Inspector } from '../inspector.js';
export class MetricsInstrument extends BaseInstrument {
    #measurements;
    dashboards;
    sensors = [];
    constructor(store, init = {}) {
        const { dashboards = [], disabled = false } = init;
        super('metrics', store, disabled);
        this.dashboards = [...Inspector.defaultDashboards(), ...dashboards];
        this.#measurements = new Measurements({
            measurements: this.#getMeasurementsFromDashboards(this.dashboards),
            store,
        });
    }
    async push(data) {
        return this.#measurements.push(data);
    }
    activate() {
        for (const [key, config] of this.#measurements.measurements) {
            if (config.sensor) {
                const cls = this.#getSensor(config.sensor);
                const sensor = new cls(key, config.interval);
                sensor.on('sample', (value) => {
                    this.#measurements.push({
                        [key]: [
                            {
                                values: [value],
                            },
                        ],
                    });
                });
                this.sensors.push(sensor);
            }
        }
        return super.activate();
    }
    deactivate() {
        for (const sensor of this.sensors) {
            sensor.destroy();
        }
        this.sensors = [];
        return super.deactivate();
    }
    async putToStore(_time, _label, _value) {
        // noop
    }
    async query(query) {
        const result = await this.#measurements.export({
            ...query,
        });
        return {
            entries: result.map((item) => [Date.now(), '', JSON.stringify(item)]),
            hasMore: false,
        };
    }
    subscribe(fn, options) {
        let time = options.startTime || Date.now();
        let subscribed = true;
        let running = false;
        const tick = () => {
            if (running) {
                return;
            }
            running = true;
            const now = Date.now();
            this.#measurements
                .export({
                keys: options.keys,
                startTime: time,
            })
                .then((result) => {
                if (subscribed) {
                    fn(time, '', JSON.stringify(result));
                }
            })
                .catch(() => {
                // TODO:
            })
                .finally(() => {
                time = now;
                running = false;
            });
        };
        const interval = setInterval(tick, options.interval || 5000);
        tick();
        return () => {
            subscribed = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }
    #getMeasurementsFromDashboards(dashboards) {
        return dashboards.reduce((acc, dashboard) => {
            for (const measurement of dashboard.measurements) {
                if (!acc.find(({ key }) => key === measurement.key)) {
                    acc.push({
                        interval: measurement.interval || 10000,
                        key: measurement.key,
                        type: measurement.type || 'aggregate',
                        sensor: measurement.sensor,
                    });
                }
            }
            return acc;
        }, []);
    }
    #getSensor(type) {
        switch (type) {
            case 'cpu':
                return CpuSensor;
            case 'event-loop-delay':
                return EventLoopDelaySensor;
            case 'memory-heap':
                return MemoryHeapSensor;
            case 'memory-rss':
                return MemoryRssSensor;
            default:
                throw new Error('Unknown sensor type.');
        }
    }
}
