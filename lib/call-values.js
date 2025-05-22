/**
 * Store for call-specific values
 * Map structure: callId -> { key: value, key2: value2, ... }
 */
const activeCallsStore = new Map();

// Backward compatibility for token functions
export const setCallToken = (callId, value) => setCallValue(callId, 'token', value);
export const resetCallToken = (callId) => resetCallValue(callId, 'token');
export const getCallToken = (callId) => getCallValue(callId, 'token');
export const hasCallToken = (callId) => hasCallValue(callId, 'token');

/**
 * Sets a value for a specific call and key
 * @param {string} callId - Call identifier
 * @param {string} key - Key to store the value under
 * @param {any} value - Value to be stored
 * @returns {boolean} - Whether the operation was successful
 */
export function setCallValue(callId, key, value) {
    try {
        if (typeof callId !== 'string' || !callId) {
            throw new Error('callId must be a non-empty string');
        }
        if (typeof key !== 'string' || !key) {
            throw new Error('key must be a non-empty string');
        }
        
        let callData = activeCallsStore.get(callId) || {};
        callData[key] = value;
        activeCallsStore.set(callId, callData);
        return true;
    } catch (error) {
        console.error(`Error setting value for call ${callId}, key ${key}:`, error);
        return false;
    }
}

/**
 * Resets/removes a specific key value for a call
 * @param {string} callId - Call identifier
 * @param {string} key - Key to reset
 * @returns {boolean} - Whether the operation was successful
 */
export function resetCallValue(callId, key) {
    try {
        if (typeof callId !== 'string' || !callId) {
            throw new Error('callId must be a non-empty string');
        }
        if (typeof key !== 'string' || !key) {
            throw new Error('key must be a non-empty string');
        }
        
        let callData = activeCallsStore.get(callId);
        if (!callData) return false;
        
        delete callData[key];
        activeCallsStore.set(callId, callData);
        return true;
    } catch (error) {
        console.error(`Error resetting value for call ${callId}, key ${key}:`, error);
        return false;
    }
}

/**
 * Gets a value for a specific call and key
 * @param {string} callId - Call identifier
 * @param {string} key - Key to get the value from
 * @returns {any|null} - Stored value or null if not found
 */
export function getCallValue(callId, key) {
    try {
        if (typeof callId !== 'string' || !callId) {
            throw new Error('callId must be a non-empty string');
        }
        if (typeof key !== 'string' || !key) {
            throw new Error('key must be a non-empty string');
        }
        
        const callData = activeCallsStore.get(callId);
        return callData?.[key] ?? null;
    } catch (error) {
        console.error(`Error getting value for call ${callId}, key ${key}:`, error);
        return null;
    }
}

/**
 * Checks if a value exists for a specific call and key
 * @param {string} callId - Call identifier
 * @param {string} key - Key to check
 * @returns {boolean} - Whether a value exists
 */
export function hasCallValue(callId, key) {
    try {
        if (typeof callId !== 'string' || !callId) {
            throw new Error('callId must be a non-empty string');
        }
        if (typeof key !== 'string' || !key) {
            throw new Error('key must be a non-empty string');
        }
        
        const callData = activeCallsStore.get(callId);
        return callData && key in callData;
    } catch (error) {
        console.error(`Error checking value for call ${callId}, key ${key}:`, error);
        return false;
    }
}

/**
 * Gets all stored values for a specific call
 * @param {string} callId - Call identifier
 * @returns {Object|null} - All stored values or null if not found
 */
export function getAllCallValues(callId) {
    try {
        if (typeof callId !== 'string' || !callId) {
            throw new Error('callId must be a non-empty string');
        }
        
        const callData = activeCallsStore.get(callId);
        return callData ? { ...callData } : null;
    } catch (error) {
        console.error(`Error getting all values for call ${callId}:`, error);
        return null;
    }
}

/**
 * Removes all stored values for a specific call
 * @param {string} callId - Call identifier to remove
 * @returns {boolean} - Whether the operation was successful
 */
export function clearCallValues(callId) {
    try {
        if (typeof callId !== 'string' || !callId) {
            throw new Error('callId must be a non-empty string');
        }
        
        return activeCallsStore.delete(callId);
    } catch (error) {
        console.error(`Error clearing values for call ${callId}:`, error);
        return false;
    }
}

/**
 * Removes all stored values for all calls
 * @returns {boolean} - Whether the operation was successful
 */
export function clearAllCallValues() {
    try {
        activeCallsStore.clear();
        return true;
    } catch (error) {
        console.error('Error clearing all call values:', error);
        return false;
    }
}

/**
 * Gets the count of active calls with stored values
 * @returns {number} - Number of active calls
 */
export function getActiveCallsCount() {
    return activeCallsStore.size;
}

/**
 * Gets all active call IDs
 * @returns {string[]} - Array of call IDs
 */
export function getActiveCallIds() {
    return Array.from(activeCallsStore.keys());
}

/**
 * Cleanup expired call values (if TTL is implemented in the future)
 * This is a placeholder for future TTL functionality
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {number} - Number of cleaned up calls
 */
export function cleanupExpiredValues(maxAge) {
    // TODO: Implement TTL cleanup when needed
    // This would require storing timestamps with each call
    console.warn('TTL cleanup not yet implemented');
    return 0;
}

/**
 * Internal function to cleanup call values (used by the router)
 * @private
 * @param {string} callId 
 */
export function _cleanupCallValues(callId) {
    clearCallValues(callId);
}