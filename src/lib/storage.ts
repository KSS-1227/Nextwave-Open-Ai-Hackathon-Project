/**
 * Safe Storage Utility for Veda Finance Bot
 * Prevents JSON parsing errors and handles storage gracefully
 */

export class SafeStorage {
  private static prefix = 'veda_finance_';

  /**
   * Safely store data in localStorage
   */
  static set(key: string, value: any): boolean {
    try {
      const prefixedKey = this.prefix + key;
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(prefixedKey, stringValue);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Safely retrieve and parse data from localStorage
   */
  static get<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const prefixedKey = this.prefix + key;
      const raw = localStorage.getItem(prefixedKey);
      
      if (raw === null) {
        return defaultValue;
      }

      // If it's already an object (shouldn't happen but let's be safe)
      if (typeof raw === 'object') {
        console.warn(`Storage key "${key}" contains object instead of string`);
        return raw as T;
      }

      // Try to parse JSON
      try {
        return JSON.parse(raw);
      } catch (parseError) {
        // If parsing fails, return the raw string
        console.warn(`Failed to parse JSON for key "${key}":`, parseError);
        return raw as T;
      }
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): boolean {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all app-specific storage
   */
  static clear(): boolean {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Check if storage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all app keys
   */
  static getKeys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch {
      return [];
    }
  }
}

// Session storage variant
export class SafeSessionStorage {
  private static prefix = 'veda_session_';

  static set(key: string, value: any): boolean {
    try {
      const prefixedKey = this.prefix + key;
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      sessionStorage.setItem(prefixedKey, stringValue);
      return true;
    } catch (error) {
      console.error('Session storage set error:', error);
      return false;
    }
  }

  static get<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const prefixedKey = this.prefix + key;
      const raw = sessionStorage.getItem(prefixedKey);
      
      if (raw === null) {
        return defaultValue;
      }

      if (typeof raw === 'object') {
        console.warn(`Session storage key "${key}" contains object instead of string`);
        return raw as T;
      }

      try {
        return JSON.parse(raw);
      } catch (parseError) {
        console.warn(`Failed to parse JSON for session key "${key}":`, parseError);
        return raw as T;
      }
    } catch (error) {
      console.error('Session storage get error:', error);
      return defaultValue;
    }
  }

  static remove(key: string): boolean {
    try {
      const prefixedKey = this.prefix + key;
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Session storage remove error:', error);
      return false;
    }
  }
}

// Error-safe JSON utilities
export const SafeJSON = {
  parse<T = any>(text: string, defaultValue: T | null = null): T | null {
    try {
      // Don't parse if it's already an object
      if (typeof text === 'object') {
        console.warn('SafeJSON.parse received object instead of string');
        return text as T;
      }

      return JSON.parse(text);
    } catch (error) {
      console.warn('SafeJSON.parse error:', error);
      return defaultValue;
    }
  },

  stringify(value: any, defaultValue: string = '{}'): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn('SafeJSON.stringify error:', error);
      return defaultValue;
    }
  }
};

export default SafeStorage;