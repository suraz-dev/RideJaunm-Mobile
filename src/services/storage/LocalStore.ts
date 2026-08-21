/**
 * ============================================================================
 * PROVIDER-NEUTRAL LOCAL STORAGE ABSTRACTION (ADR-005)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * In RideJaunm, we need a reliable way to save user settings, routes, and
 * offline outbox transactions to the device disk.
 *
 * To prevent the rest of our app from being tightly coupled to a single storage
 * library (like AsyncStorage, MMKV, or SQLCipher), we define an abstract
 * `LocalStore` interface. This allows us to swap the underlying storage engine
 * in the future (e.g. upgrading to hardware-encrypted SQLCipher in native builds)
 * without breaking any screen or business logic.
 *
 * FAULT VISIBILITY (R6-5):
 * Instead of silently returning null on errors (which could mask file corruption),
 * `read<T>()` returns a discriminated union (`StorageReadResult<T>`) indicating
 * whether data was found, missing, corrupted, or unreadable.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Represents the exhaustive outcome of a storage read operation.
 * - 'found': Data was retrieved and parsed successfully.
 * - 'not_found': Key does not exist in storage (clean empty state).
 * - 'corrupted': Key exists but contains malformed/unparseable JSON data.
 * - 'read_failed': Underlying disk/IO operation threw an error.
 */
export type StorageReadResult<T> =
  | { status: 'found'; data: T }
  | { status: 'not_found' }
  | { status: 'corrupted'; rawValue: string; error: string }
  | { status: 'read_failed'; error: string };

/**
 * Interface that all storage adapters (AsyncStorage, MMKV, MemoryStore) must implement.
 */
export interface LocalStore {
  /** Prepare or hydrate underlying database/storage connections */
  hydrate(): Promise<void>;

  /** Read and parse a typed value from storage */
  read<T>(key: string): Promise<StorageReadResult<T>>;

  /** Serialize and persist a typed value to storage */
  write<T>(key: string, value: T): Promise<void>;

  /** Delete a specific key from storage */
  remove(key: string): Promise<void>;

  /** Clear all account-scoped keys when logging out or resetting local cache */
  clearAccountScopedData(): Promise<void>;
}

/**
 * AsyncStorage Development Adapter:
 * Uses React Native's AsyncStorage for local persistence during development & simulator testing.
 * All keys are prefixed with '@ridejaunm:' to prevent namespace collisions.
 */
export class AsyncStorageLocalStore implements LocalStore {
  private prefix = '@ridejaunm:';

  async hydrate(): Promise<void> {
    // AsyncStorage doesn't require pre-connection initialization
    return Promise.resolve();
  }

  async read<T>(key: string): Promise<StorageReadResult<T>> {
    let raw: string | null = null;
    try {
      raw = await AsyncStorage.getItem(this.prefix + key);
    } catch (err: unknown) {
      // Disk/driver failure
      return {
        status: 'read_failed',
        error: err instanceof Error ? err.message : String(err),
      };
    }

    // Key does not exist
    if (raw === null || raw === undefined) {
      return { status: 'not_found' };
    }

    // Attempt JSON parsing with corruption catching
    try {
      const parsed = JSON.parse(raw) as T;
      return { status: 'found', data: parsed };
    } catch (err: unknown) {
      // JSON corruption detected: surface it explicitly rather than silently masking as empty
      return {
        status: 'corrupted',
        rawValue: raw,
        error: err instanceof Error ? err.message : String(err),
      };
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

/**
 * In-Memory Test Adapter:
 * Fast, isolated key-value store used in automated Jest unit & integration tests.
 * Allows simulating disk IO errors and corrupted JSON payloads.
 */
export class MemoryLocalStore implements LocalStore {
  private memory = new Map<string, string>();
  private shouldFailReads = false;

  /** Allows unit tests to simulate disk read failures */
  setSimulateReadFailure(fail: boolean) {
    this.shouldFailReads = fail;
  }

  /** Allows unit tests to inject corrupted/invalid JSON strings */
  setRawValue(key: string, raw: string) {
    this.memory.set(key, raw);
  }

  async hydrate(): Promise<void> {
    return Promise.resolve();
  }

  async read<T>(key: string): Promise<StorageReadResult<T>> {
    if (this.shouldFailReads) {
      return { status: 'read_failed', error: 'Simulated memory store IO error' };
    }

    const raw = this.memory.get(key);
    if (raw === undefined) {
      return { status: 'not_found' };
    }

    try {
      const parsed = JSON.parse(raw) as T;
      return { status: 'found', data: parsed };
    } catch (err: unknown) {
      return {
        status: 'corrupted',
        rawValue: raw,
        error: err instanceof Error ? err.message : String(err),
      };
    }
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

/**
 * Global default storage adapter singleton (configured development adapter)
 */
export const localStore: LocalStore = new AsyncStorageLocalStore();
