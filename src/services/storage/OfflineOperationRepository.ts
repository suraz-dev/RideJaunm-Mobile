/**
 * ============================================================================
 * OFFLINE OUTBOX & TRANSACTION QUEUE REPOSITORY
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * When riding through remote Himalayan mountain passes (e.g. Manang, Mustang, Dolpa),
 * cellular coverage is frequently non-existent (dead zones).
 *
 * When a rider performs an action offline (such as reporting a landslide hazard,
 * logging telemetry breadcrumbs, or updating garage settings), the app must NOT
 * lose the action or fail with an error dialog.
 *
 * Instead, this repository stores operations into an "Outbox" queue on the local disk.
 * Once internet connectivity is restored, a background synchronization worker
 * can replay and upload these queued operations.
 *
 * FAULT SAFETY & PRESERVATION (RC-1):
 * If the on-disk outbox key is corrupted or unreadable, this repository MUST NOT
 * silently replace it with an empty array or allow subsequent enqueue operations to
 * overwrite the corrupted file. It preserves the disk state and surfaces the storage fault.
 *
 * IDEMPOTENCY SAFETY:
 * Every queued operation has an `idempotencyKey`. If an operation is enqueued
 * multiple times (or retried after a network timeout), this repository updates the
 * existing queue item rather than creating duplicate transactions.
 */

import { LocalStore, StorageReadResult } from './LocalStore';
import { QueuedOperation, OperationState } from '../../domain/outbox';

const OUTBOX_STORAGE_KEY = 'outbox_operations_v1';

export interface OfflineOperationRepository {
  /** Inspect the raw read result of the outbox storage key (found, not_found, corrupted, read_failed) */
  loadQueueResult(): Promise<StorageReadResult<QueuedOperation[]>>;

  /** Add an operation to the local outbox. Throws error if outbox storage is corrupted to prevent overwrite */
  enqueue(operation: QueuedOperation): Promise<void>;

  /** List all operations waiting to be synced ('queued' or 'sending') */
  listPending(): Promise<QueuedOperation[]>;

  /** List all operations including completed and failed ones */
  listAll(): Promise<QueuedOperation[]>;

  /** Mark the outcome of a synchronization attempt */
  markResult(
    id: string,
    result: 'accepted' | 'rejected' | 'conflicted',
    errorCode?: string,
    errorMessage?: string
  ): Promise<void>;

  /** Clear all queued items from storage (e.g. on account reset) */
  clear(): Promise<void>;
}

export class DefaultOfflineOperationRepository implements OfflineOperationRepository {
  constructor(private store: LocalStore) {}

  /**
   * Retrieves the raw storage result for the outbox queue.
   */
  async loadQueueResult(): Promise<StorageReadResult<QueuedOperation[]>> {
    return this.store.read<QueuedOperation[]>(OUTBOX_STORAGE_KEY);
  }

  /**
   * Internal helper to load the queue.
   * Throws an explicit error if the outbox is corrupted or unreadable
   * to strictly prevent overwriting corrupted rider data.
   */
  private async getValidQueueForMutation(): Promise<QueuedOperation[]> {
    const result = await this.loadQueueResult();

    if (result.status === 'found') {
      return result.data;
    }
    if (result.status === 'not_found') {
      return [];
    }
    if (result.status === 'corrupted') {
      throw new Error(
        `OUTBOX_STORAGE_CORRUPTED: Outbox cannot be mutated because on-disk queue JSON is malformed (${result.error}). Preserving disk key.`
      );
    }
    throw new Error(
      `OUTBOX_STORAGE_READ_FAILED: Outbox cannot be mutated due to disk IO error (${result.error}). Preserving disk key.`
    );
  }

  /** Helper to save the updated queue array back to disk */
  private async saveQueue(queue: QueuedOperation[]): Promise<void> {
    await this.store.write(OUTBOX_STORAGE_KEY, queue);
  }

  /**
   * Enqueues an operation idempotently.
   * Refuses to overwrite if outbox storage is in a faulted state (RC-1).
   */
  async enqueue(operation: QueuedOperation): Promise<void> {
    const queue = await this.getValidQueueForMutation();

    const existingIndex = queue.findIndex(
      (op) => op.idempotencyKey === operation.idempotencyKey
    );

    if (existingIndex >= 0) {
      queue[existingIndex] = {
        ...queue[existingIndex],
        ...operation,
      };
    } else {
      queue.push(operation);
    }

    await this.saveQueue(queue);
  }

  /**
   * Retrieves all items currently awaiting transmission.
   * Returns empty array if key does not exist; returns empty and leaves fault handling to loadQueueResult.
   */
  async listPending(): Promise<QueuedOperation[]> {
    const result = await this.loadQueueResult();
    if (result.status === 'found') {
      return result.data.filter((op) => op.state === 'queued' || op.state === 'sending');
    }
    return [];
  }

  /**
   * Retrieves full history of all operations in the store.
   */
  async listAll(): Promise<QueuedOperation[]> {
    const result = await this.loadQueueResult();
    if (result.status === 'found') {
      return result.data;
    }
    return [];
  }

  /**
   * Updates an item's status after a sync attempt.
   */
  async markResult(
    id: string,
    result: 'accepted' | 'rejected' | 'conflicted',
    errorCode?: string,
    errorMessage?: string
  ): Promise<void> {
    const queue = await this.getValidQueueForMutation();
    const item = queue.find((op) => op.operationId === id);

    if (item) {
      item.state = result as OperationState;
      item.lastAttemptUtc = new Date().toISOString();
      item.attemptCount += 1;
      if (errorCode) item.lastErrorCode = errorCode;
      if (errorMessage) item.lastErrorMessage = errorMessage;
      await this.saveQueue(queue);
    }
  }

  /**
   * Clears the entire outbox storage key from the device.
   */
  async clear(): Promise<void> {
    await this.store.remove(OUTBOX_STORAGE_KEY);
  }
}
