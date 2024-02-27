import { ValidationSchema } from './types.js';
export declare function isBun(): boolean;
export declare function isInspectorLike(inspector: any): boolean;
export declare function getFunctionCallStack(ignore?: string[]): string[];
export declare function getModulesFromCallStack(stack: string[]): string[];
export declare function validate(schema: Record<string, ValidationSchema>, obj: any): void;
