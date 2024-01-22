import { SensorBase } from '../base.js';
export declare class CpuSensor extends SensorBase {
    #private;
    sample(): Promise<number>;
}
