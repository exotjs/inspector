import { describe, expect, it } from 'vitest';
import {
  getFunctionCallStack,
  getModulesFromCallStack,
  validate,
} from '../lib/helpers.js';
import { ValidationSchema } from '../lib/types.js';

describe('helpers', () => {
  describe('validate()', () => {
    it('should throw if the object does not match the schema', () => {
      expect(() =>
        validate(
          {
            name: {
              type: 'string',
            },
          },
          {}
        )
      ).toThrow();
    });

    it('should not throw if the object matches the schema', () => {
      expect(() =>
        validate(
          {
            name: {
              type: 'string',
            },
          },
          {
            name: 'test',
          }
        )
      ).not.toThrow();
    });

    describe('complex schema', () => {
      const schema: Record<string, ValidationSchema> = {
        active: {
          optional: true,
          type: 'boolean',
        },
        age: {
          type: 'number',
        },
        hobbies: {
          optional: true,
          type: 'array',
        },
        name: {
          type: 'string',
        },
      };

      it('should not throw if the object matches', () => {
        expect(() =>
          validate(schema, {
            age: 20,
            name: 'test',
          })
        ).not.toThrow();
      });

      it('should throw if "active" is not a boolean', () => {
        expect(() =>
          validate(schema, {
            active: 'true',
            age: 20,
            name: 'test',
          })
        ).toThrow();
      });

      it('should throw if "age" is not a number', () => {
        expect(() =>
          validate(schema, {
            age: 'xx',
            name: 'test',
          })
        ).toThrow();
      });

      it('should throw if "name" is not a string', () => {
        expect(() =>
          validate(schema, {
            age: 20,
            name: 123,
          })
        ).toThrow();
      });

      it('should throw if "hobbies" is not an array', () => {
        expect(() =>
          validate(schema, {
            age: 20,
            hobbies: {},
            name: 'test',
          })
        ).toThrow();
      });
    });
  });

  describe('getFunctionCallStack()', () => {
    it('should return a call stack', () => {
      function testFn() {
        return getFunctionCallStack();
      }
      const stack = testFn();
      expect(stack).toBeDefined();
      expect(Array.isArray(stack)).toBeTruthy();
      expect(stack.length).toBeGreaterThan(4);
      expect(stack.find((line) => line.includes('testFn'))).toBeDefined();
    });
  });

  describe('getModulesFromCallStack()', () => {
    it('should return an array of npm modules from a stack', () => {
      const modules = getModulesFromCallStack(getFunctionCallStack());
      expect(modules).toEqual(['@vitest/runner']);
    });
  });
});
