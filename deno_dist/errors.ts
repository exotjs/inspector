export class BaseError extends Error {
  code = 0;

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export class InactiveInstrumentError extends BaseError {
  code = 1001;

  constructor() {
    super('Instrument is not active.');
  }
}

export class DisabledInstrumentError extends BaseError {
  code = 1002;

  constructor() {
    super('Instrument is disabled.');
  }
}
