import { Inspector } from './inspector.js';
export function isBun() {
    return !!process.versions.bun;
}
export function isInspectorLike(inspector) {
    return (!!inspector &&
        (inspector instanceof Inspector ||
            ('instruments' in inspector && 'createSession' in inspector)));
}
export function getFunctionCallStack(ignore = ['getFunctionCallStack']) {
    const obj = {};
    Error.captureStackTrace(obj);
    const stack = obj.stack;
    return stack
        .split('\n')
        .slice(1)
        .filter((line) => ignore.every((i) => !line.includes(i)))
        .map((line) => line.replace(/^\s+at\s/, ''));
}
export function getModulesFromCallStack(stack) {
    return stack.reduce((acc, line) => {
        if (line.includes('/node_modules/')) {
            const names = line.match(/node_modules(\/.deno)?\/([^\/]+)\/([^\/]+)/);
            if (names) {
                const name = (names[2].startsWith('@') ? `${names[2]}/${names[3]}` : names[2]).replace(/@[\d\.]+/, '');
                if (!acc.includes(name)) {
                    acc.push(name);
                }
            }
        }
        return acc;
    }, []);
}
export function validate(schema, obj) {
    if (!obj || typeof obj !== 'object') {
        throw new Error('Expected object.');
    }
    for (let key in schema) {
        const { optional, properties, type } = schema[key];
        if (optional && obj[key] === void 0) {
            continue;
        }
        if (type === 'array') {
            if (!Array.isArray(obj[key])) {
                throw new Error(`Property ${key} expected to be array.`);
            }
        }
        else if (typeof obj[key] !== type || obj[key] === null) {
            throw new Error(`Property ${key} expected to be ${schema[key]}.`);
        }
        if (properties) {
            validate(properties, obj[key]);
        }
    }
}
