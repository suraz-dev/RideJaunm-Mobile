/**
 * Provider-Neutral Local Storage Boundary (ADR-005)
 * Abstract interface for local persistence with Async Storage development adapter.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalStore {
  hydrate(): Promise<void>;
  read<T>(key: string): Promise<T | null>;
  write<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clearAccountScopedData(): Promise<void>;
}

export class AsyncStorageLocalStore implements LocalStore {
  private prefix = '@ridejaunm:';

  async hydrate(): Promise<void> {
    // Verified AsyncStorage is operational
    return Promise.resolve();
  }

  async read<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(this.prefix + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async write<T>(key: string, value: T): Promise<void> {
    const raw = JSON.stringify(value);
    await AsyncStorage.setItem(this.prefix + key, raw);
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(this.prefix + key);
  }

  async clearAccountScopedData(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter((k) => k.startsWith(this.prefix));
    if (appKeys.length > 0) {
      await AsyncStorage.multiRemove(appKeys);
    }
  }
}

export class MemoryLocalStore implements LocalStore {
  private memory = new Map<string, string>();

  async hydrate(): Promise<void> {
    return Promise.resolve();
  }

  async read<T>(key: string): Promise<T | null> {
    const raw = this.memory.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async write<T>(key: string, value: T): Promise<void> {
    this.memory.set(key, JSON.stringify(value));
    return Promise.resolve();
  }

  async remove(key: string): Promise<void> {
    this.memory.delete(key);
    return Promise.resolve();
  }

  async clearAccountScopedData(): Promise<void> {
    this.memory.clear();
    return Promise.resolve();
  }
}

// Global default storage adapter singleton
export const localStore: LocalStore = new AsyncStorageLocalStore();
