export declare class BaseError extends Error {
    code: number;
    toJSON(): {
        code: number;
        message: string;
    };
}
export declare class InactiveInstrumentError extends BaseError {
    code: number;
    constructor();
}
export declare class DisabledInstrumentError extends BaseError {
    code: number;
    constructor();
}
