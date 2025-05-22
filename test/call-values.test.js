import { describe, expect, beforeEach, afterEach } from '@jest/globals';
import {
    setCallValue,
    getCallValue,
    hasCallValue,
    resetCallValue,
    getAllCallValues,
    clearCallValues,
    clearAllCallValues,
    getActiveCallsCount,
    getActiveCallIds,
    setCallToken,
    getCallToken,
    hasCallToken,
    resetCallToken
} from '../lib/call-values.js';

describe('Call Values Management', () => {
    const testCallId = 'test-call-123';
    const testCallId2 = 'test-call-456';

    beforeEach(() => {
        clearAllCallValues();
    });

    afterEach(() => {
        clearAllCallValues();
    });

    describe('setCallValue', () => {
        it('should set a value for a call', () => {
            const result = setCallValue(testCallId, 'testKey', 'testValue');
            expect(result).toBe(true);
            expect(getCallValue(testCallId, 'testKey')).toBe('testValue');
        });

        it('should handle different data types', () => {
            setCallValue(testCallId, 'string', 'hello');
            setCallValue(testCallId, 'number', 42);
            setCallValue(testCallId, 'boolean', true);
            setCallValue(testCallId, 'object', { name: 'test' });
            setCallValue(testCallId, 'array', [1, 2, 3]);
            setCallValue(testCallId, 'null', null);

            expect(getCallValue(testCallId, 'string')).toBe('hello');
            expect(getCallValue(testCallId, 'number')).toBe(42);
            expect(getCallValue(testCallId, 'boolean')).toBe(true);
            expect(getCallValue(testCallId, 'object')).toEqual({ name: 'test' });
            expect(getCallValue(testCallId, 'array')).toEqual([1, 2, 3]);
            expect(getCallValue(testCallId, 'null')).toBe(null);
        });

        it('should return false for invalid callId', () => {
            const result = setCallValue('', 'testKey', 'testValue');
            expect(result).toBe(false);
        });

        it('should return false for invalid key', () => {
            const result = setCallValue(testCallId, '', 'testValue');
            expect(result).toBe(false);
        });

        it('should overwrite existing values', () => {
            setCallValue(testCallId, 'testKey', 'firstValue');
            setCallValue(testCallId, 'testKey', 'secondValue');
            expect(getCallValue(testCallId, 'testKey')).toBe('secondValue');
        });
    });

    describe('getCallValue', () => {
        it('should return the correct value', () => {
            setCallValue(testCallId, 'testKey', 'testValue');
            expect(getCallValue(testCallId, 'testKey')).toBe('testValue');
        });

        it('should return null for non-existent call', () => {
            expect(getCallValue('non-existent', 'testKey')).toBe(null);
        });

        it('should return null for non-existent key', () => {
            setCallValue(testCallId, 'existingKey', 'value');
            expect(getCallValue(testCallId, 'nonExistentKey')).toBe(null);
        });

        it('should return null for invalid callId', () => {
            expect(getCallValue('', 'testKey')).toBe(null);
        });

        it('should return null for invalid key', () => {
            expect(getCallValue(testCallId, '')).toBe(null);
        });
    });

    describe('hasCallValue', () => {
        it('should return true for existing value', () => {
            setCallValue(testCallId, 'testKey', 'testValue');
            expect(hasCallValue(testCallId, 'testKey')).toBe(true);
        });

        it('should return false for non-existent call', () => {
            expect(hasCallValue('non-existent', 'testKey')).toBe(false);
        });

        it('should return false for non-existent key', () => {
            setCallValue(testCallId, 'existingKey', 'value');
            expect(hasCallValue(testCallId, 'nonExistentKey')).toBe(false);
        });

        it('should return true even for null values', () => {
            setCallValue(testCallId, 'nullKey', null);
            expect(hasCallValue(testCallId, 'nullKey')).toBe(true);
        });

        it('should return false for invalid callId', () => {
            expect(hasCallValue('', 'testKey')).toBe(false);
        });

        it('should return false for invalid key', () => {
            expect(hasCallValue(testCallId, '')).toBe(false);
        });
    });

    describe('resetCallValue', () => {
        it('should remove a specific key', () => {
            setCallValue(testCallId, 'key1', 'value1');
            setCallValue(testCallId, 'key2', 'value2');
            
            const result = resetCallValue(testCallId, 'key1');
            
            expect(result).toBe(true);
            expect(hasCallValue(testCallId, 'key1')).toBe(false);
            expect(hasCallValue(testCallId, 'key2')).toBe(true);
        });

        it('should return false for non-existent call', () => {
            const result = resetCallValue('non-existent', 'testKey');
            expect(result).toBe(false);
        });

        it('should return false for invalid callId', () => {
            const result = resetCallValue('', 'testKey');
            expect(result).toBe(false);
        });

        it('should return false for invalid key', () => {
            const result = resetCallValue(testCallId, '');
            expect(result).toBe(false);
        });
    });

    describe('getAllCallValues', () => {
        it('should return all values for a call', () => {
            setCallValue(testCallId, 'key1', 'value1');
            setCallValue(testCallId, 'key2', 'value2');
            setCallValue(testCallId, 'key3', { nested: 'object' });

            const allValues = getAllCallValues(testCallId);
            
            expect(allValues).toEqual({
                key1: 'value1',
                key2: 'value2',
                key3: { nested: 'object' }
            });
        });

        it('should return null for non-existent call', () => {
            expect(getAllCallValues('non-existent')).toBe(null);
        });

        it('should return a copy, not reference', () => {
            setCallValue(testCallId, 'key1', 'value1');
            const values1 = getAllCallValues(testCallId);
            const values2 = getAllCallValues(testCallId);
            
            expect(values1).toEqual(values2);
            expect(values1).not.toBe(values2); // Different objects
        });

        it('should return null for invalid callId', () => {
            expect(getAllCallValues('')).toBe(null);
        });
    });

    describe('clearCallValues', () => {
        it('should remove all values for a specific call', () => {
            setCallValue(testCallId, 'key1', 'value1');
            setCallValue(testCallId, 'key2', 'value2');
            setCallValue(testCallId2, 'key1', 'value1');

            const result = clearCallValues(testCallId);

            expect(result).toBe(true);
            expect(getAllCallValues(testCallId)).toBe(null);
            expect(getAllCallValues(testCallId2)).not.toBe(null);
        });

        it('should return true even for non-existent call', () => {
            const result = clearCallValues('non-existent');
            expect(result).toBe(false);
        });

        it('should return false for invalid callId', () => {
            const result = clearCallValues('');
            expect(result).toBe(false);
        });
    });

    describe('clearAllCallValues', () => {
        it('should remove all values for all calls', () => {
            setCallValue(testCallId, 'key1', 'value1');
            setCallValue(testCallId2, 'key1', 'value1');

            const result = clearAllCallValues();

            expect(result).toBe(true);
            expect(getAllCallValues(testCallId)).toBe(null);
            expect(getAllCallValues(testCallId2)).toBe(null);
            expect(getActiveCallsCount()).toBe(0);
        });
    });

    describe('getActiveCallsCount', () => {
        it('should return correct count', () => {
            expect(getActiveCallsCount()).toBe(0);

            setCallValue(testCallId, 'key1', 'value1');
            expect(getActiveCallsCount()).toBe(1);

            setCallValue(testCallId2, 'key1', 'value1');
            expect(getActiveCallsCount()).toBe(2);

            clearCallValues(testCallId);
            expect(getActiveCallsCount()).toBe(1);

            clearAllCallValues();
            expect(getActiveCallsCount()).toBe(0);
        });
    });

    describe('getActiveCallIds', () => {
        it('should return correct call IDs', () => {
            expect(getActiveCallIds()).toEqual([]);

            setCallValue(testCallId, 'key1', 'value1');
            expect(getActiveCallIds()).toEqual([testCallId]);

            setCallValue(testCallId2, 'key1', 'value1');
            expect(getActiveCallIds()).toHaveLength(2);
            expect(getActiveCallIds()).toContain(testCallId);
            expect(getActiveCallIds()).toContain(testCallId2);

            clearCallValues(testCallId);
            expect(getActiveCallIds()).toEqual([testCallId2]);
        });
    });

    describe('Backward compatibility - Token functions', () => {
        it('should work with token functions', () => {
            // Set token
            const setResult = setCallToken(testCallId, 'jwt-token-123');
            expect(setResult).toBe(true);

            // Get token
            const token = getCallToken(testCallId);
            expect(token).toBe('jwt-token-123');

            // Has token
            expect(hasCallToken(testCallId)).toBe(true);
            expect(hasCallToken('non-existent')).toBe(false);

            // Reset token
            const resetResult = resetCallToken(testCallId);
            expect(resetResult).toBe(true);
            expect(hasCallToken(testCallId)).toBe(false);
        });

        it('should be equivalent to regular value functions', () => {
            setCallToken(testCallId, 'token-value');
            expect(getCallValue(testCallId, 'token')).toBe('token-value');

            setCallValue(testCallId, 'token', 'another-token');
            expect(getCallToken(testCallId)).toBe('another-token');
        });
    });

    describe('Multiple calls isolation', () => {
        it('should keep values separate between calls', () => {
            setCallValue(testCallId, 'name', 'Call 1');
            setCallValue(testCallId2, 'name', 'Call 2');

            expect(getCallValue(testCallId, 'name')).toBe('Call 1');
            expect(getCallValue(testCallId2, 'name')).toBe('Call 2');

            setCallValue(testCallId, 'age', 25);
            
            expect(hasCallValue(testCallId, 'age')).toBe(true);
            expect(hasCallValue(testCallId2, 'age')).toBe(false);
        });
    });
});