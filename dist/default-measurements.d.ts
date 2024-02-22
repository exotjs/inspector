declare const _default: ({
    interval: number;
    key: string;
    sensor: string;
    type: "aggregate";
} | {
    interval: number;
    key: string;
    type: "sum";
    sensor?: undefined;
} | {
    interval: number;
    key: string;
    type: "aggregate";
    sensor?: undefined;
})[];
export default _default;
