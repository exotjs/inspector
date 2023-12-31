
export interface MeasurementConfig {
  interval: number;
  key: string;
  type: 'counter' | 'number' | 'value';
}

export interface MeasurementsInit {
  measurements: MeasurementConfig[];
}

export abstract class SensorBase {
  constructor(
    readonly name: string,
  ) {
  }

  abstract sample(): Promise<number>;
}