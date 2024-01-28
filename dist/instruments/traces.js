import { BaseInstrument } from '../base.js';
export class TracesInstrument extends BaseInstrument {
    constructor(store, init = {}) {
        const { disabled = false } = init;
        super('traces', store, disabled);
    }
    getEntryLabel(value) {
        return value.label || '';
    }
    getEntryTime(entry) {
        return Math.floor(entry.start);
    }
    flattenSpan(span) {
        if (span.end) {
            // @ts-expect-error
            delete span.end;
        }
        if (span.parent) {
            delete span.parent;
        }
        if (span.traces?.length) {
            for (let child of span.traces) {
                this.flattenSpan(child);
            }
        }
        return span;
    }
    serializeValue(value) {
        return JSON.stringify(this.flattenSpan(value));
    }
    trace(fn, options, onSpanCreated, onSpanEnded) {
        const span = this.startSpan({
            name: fn.name,
            ...options,
        });
        const end = () => {
            span.end();
            if (onSpanEnded) {
                onSpanEnded(span);
            }
        };
        if (onSpanCreated) {
            onSpanCreated(span);
        }
        let result = undefined;
        try {
            result = fn(span);
        }
        finally {
            if (result instanceof Promise) {
                return result.finally(() => {
                    end();
                });
            }
            end();
        }
        return result;
    }
    startSpan(options) {
        const span = {
            attributes: options.attributes,
            description: options.description,
            duration: 0,
            label: options.label,
            name: options.name,
            parent: options.parent,
            start: Math.floor((performance.timeOrigin + performance.now()) * 100) / 100,
            traceId: options.traceId,
            end: () => {
                if (!span.duration) {
                    span.duration =
                        Math.floor((performance.timeOrigin + performance.now() - span.start) * 100) / 100;
                    if (span.traces?.length) {
                        for (let sub of span.traces) {
                            sub.end();
                        }
                    }
                    if (!options.parent) {
                        this.push(span);
                    }
                }
                return span;
            },
        };
        if (options.parent) {
            if (!options.parent.traces) {
                options.parent.traces = [];
            }
            options.parent.traces.push(span);
        }
        return span;
    }
}
