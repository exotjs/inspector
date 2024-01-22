import { SensorBase } from '../base.js';
export declare class EventLoopDelaySensor extends SensorBase {
    sample(): Promise<number>;
}
