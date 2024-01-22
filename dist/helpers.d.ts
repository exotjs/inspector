import { ValidationSchema } from './types.js';
export declare function isBun(): boolean;
export declare function getCallStack(): string[];
export declare function getModulesFromCallStack(stack: string[]): string[];
export declare function validate(schema: Record<string, ValidationSchema>, obj: any): void;
