/**
 * Storage Cleanup Utility
 * Fixes corrupted localStorage/sessionStorage entries
 */

export interface CleanupResult {
  removedKeys: string[];
  errors: string[];
  totalCleaned: number;
}

export const StorageCleanup = {
  /**
   * Clean corrupted localStorage entries
   */
  cleanLocalStorage(): CleanupResult {
    const result: CleanupResult = {
      removedKeys: [],
      errors: [],
      totalCleaned: 0
    };

    try {
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        try {
          const value = localStorage.getItem(key);
          
          // Check for common corruption patterns
          if (value === '[object Object]' || 
              value === 'undefined' || 
              value === 'null' ||
              this.isCorruptedJSON(value)) {
            
            localStorage.removeItem(key);
            result.removedKeys.push(key);
            result.totalCleaned++;
            console.log(`Cleaned corrupted localStorage key: ${key}`);
          }
        } catch (error) {
          // If we can't even access the key, remove it
          try {
            localStorage.removeItem(key);
            result.removedKeys.push(key);
            result.totalCleaned++;
          } catch (removeError) {
            result.errors.push(`Failed to remove key ${key}: ${removeError}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`localStorage cleanup failed: ${error}`);
    }

    return result;
  },

  /**
   * Clean corrupted sessionStorage entries
   */
  cleanSessionStorage(): CleanupResult {
    const result: CleanupResult = {
      removedKeys: [],
      errors: [],
      totalCleaned: 0
    };

    try {
      const keys = Object.keys(sessionStorage);
      
      for (const key of keys) {
        try {
          const value = sessionStorage.getItem(key);
          
          if (value === '[object Object]' || 
              value === 'undefined' || 
              value === 'null' ||
              this.isCorruptedJSON(value)) {
            
            sessionStorage.removeItem(key);
            result.removedKeys.push(key);
            result.totalCleaned++;
            console.log(`Cleaned corrupted sessionStorage key: ${key}`);
          }
        } catch (error) {
          try {
            sessionStorage.removeItem(key);
            result.removedKeys.push(key);
            result.totalCleaned++;
          } catch (removeError) {
            result.errors.push(`Failed to remove key ${key}: ${removeError}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`sessionStorage cleanup failed: ${error}`);
    }

    return result;
  },

  /**
   * Check if a string looks like corrupted JSON
   */
  isCorruptedJSON(value: string | null): boolean {
    if (!value || typeof value !== 'string') return false;

    // Common corruption patterns
    const corruptionPatterns = [
      /^\[object\s+\w+\]$/,  // [object Object], [object Array], etc.
      /^undefined$/,
      /^null$/,
      /^NaN$/,
      /^\{.*\[object\s+\w+\].*\}$/,  // Objects containing [object X]
    ];

    return corruptionPatterns.some(pattern => pattern.test(value));
  },

  /**
   * Full cleanup of both storage types
   */
  cleanAllStorage(): { local: CleanupResult; session: CleanupResult } {
    console.log('🧹 Running storage cleanup...');
    
    const localResult = this.cleanLocalStorage();
    const sessionResult = this.cleanSessionStorage();

    console.log('✅ Storage cleanup complete:', {
      localStorage: `${localResult.totalCleaned} items cleaned`,
      sessionStorage: `${sessionResult.totalCleaned} items cleaned`,
      errors: localResult.errors.length + sessionResult.errors.length
    });

    return {
      local: localResult,
      session: sessionResult
    };
  },

  /**
   * Validate storage is working properly
   */
  validateStorage(): { localStorage: boolean; sessionStorage: boolean } {
    const result = { localStorage: false, sessionStorage: false };

    // Test localStorage
    try {
      const testKey = '__storage_test__';
      const testValue = { test: true, timestamp: Date.now() };
      
      localStorage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
      
      result.localStorage = retrieved.test === true;
      localStorage.removeItem(testKey);
    } catch (error) {
      console.warn('localStorage validation failed:', error);
    }

    // Test sessionStorage
    try {
      const testKey = '__session_test__';
      const testValue = { test: true, timestamp: Date.now() };
      
      sessionStorage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = JSON.parse(sessionStorage.getItem(testKey) || '{}');
      
      result.sessionStorage = retrieved.test === true;
      sessionStorage.removeItem(testKey);
    } catch (error) {
      console.warn('sessionStorage validation failed:', error);
    }

    return result;
  }
};

// Auto-run cleanup on import if corruption detected
let autoCleanupRun = false;

export const runAutoCleanup = () => {
  if (autoCleanupRun) return;
  autoCleanupRun = true;

  try {
    // Quick check for obvious corruption
    const suspiciousKeys = Object.keys(localStorage).filter(key => {
      try {
        const value = localStorage.getItem(key);
        return value === '[object Object]';
      } catch {
        return true;
      }
    });

    if (suspiciousKeys.length > 0) {
      console.warn(`🚨 Detected ${suspiciousKeys.length} corrupted storage keys, running cleanup...`);
      StorageCleanup.cleanAllStorage();
    }
  } catch (error) {
    console.warn('Auto-cleanup failed:', error);
  }
};

export default StorageCleanup;