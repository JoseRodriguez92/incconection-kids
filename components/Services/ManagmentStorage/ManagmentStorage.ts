
export class ManagmentStorage {
    /**
     * Add a value to localStorage. Automatically stringifies objects.
     * @param key The key under which to store the value.
     * @param value The value to store (string or object).
     */
    static setItem(key: string, value: any): void {
        try {
            const toStore = typeof value === "string" ? value : JSON.stringify(value);
            localStorage.setItem(key, toStore);
        } catch (error) {
            console.error("Error setting item in localStorage:", error);
        }
    }

    /**
     * Retrieve a value from localStorage. Attempts to parse JSON, falls back to string.
     * @param key The key to retrieve.
     * @returns The parsed value, or null if not found.
     */
    static getItem<T = any>(key: string): T | null {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return null;
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        } catch (error) {
            console.error("Error getting item from localStorage:", error);
            return null;
        }
    }

    /**
     * Remove a value from localStorage.
     * @param key The key to remove.
     */
    static removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Error removing item from localStorage:", error);
        }
    }

    /**
     * Clear all items from localStorage.
     */
    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    }

};

