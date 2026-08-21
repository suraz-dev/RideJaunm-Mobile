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
 * IDEMPOTENCY SAFETY:
 * Every queued operation has an `idempotencyKey`. If an operation is enqueued
 * multiple times (or retried after a network timeout), this repository updates the
 * existing queue item rather than creating duplicate transactions.
 */

import { LocalStore, StorageReadResult } from './LocalStore';
import { QueuedOperation, OperationState } from '../../domain/outbox';

const OUTBOX_STORAGE_KEY = 'outbox_operations_v1';

export interface OfflineOperationRepository {
  /** Add an operation to the local outbox or update existing if idempotencyKey matches */
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

  /** Helper to load the current queue array from disk */
  private async loadQueue(): Promise<QueuedOperation[]> {
    const result: StorageReadResult<QueuedOperation[]> =
      await this.store.read<QueuedOperation[]>(OUTBOX_STORAGE_KEY);

    if (result.status === 'found') {
      return result.data;
    }
    // Return empty array if not found, corrupted, or failed to read
    return [];
  }

  /** Helper to save the updated queue array back to disk */
  private async saveQueue(queue: QueuedOperation[]): Promise<void> {
    await this.store.write(OUTBOX_STORAGE_KEY, queue);
  }

  /**
   * Enqueues an operation idempotently.
   * If an operation with the same `idempotencyKey` already exists, we update it
   * (e.g. increment attempt count, update payload) to prevent duplicate server writes.
   */
  async enqueue(operation: QueuedOperation): Promise<void> {
    const queue = await this.loadQueue();

    const existingIndex = queue.findIndex(
      (op) => op.idempotencyKey === operation.idempotencyKey
    );

    if (existingIndex >= 0) {
      // Update existing record
      queue[existingIndex] = {
        ...queue[existingIndex],
        ...operation,
      };
    } else {
      // Insert new record at the end of the queue
      queue.push(operation);
    }

    await this.saveQueue(queue);
  }

  /**
   * Retrieves all items currently awaiting transmission to the backend or peer mesh.
   */
  async listPending(): Promise<QueuedOperation[]> {
    const queue = await this.loadQueue();
    return queue.filter((op) => op.state === 'queued' || op.state === 'sending');
  }

  /**
   * Retrieves full history of all operations in the store.
   */
  async listAll(): Promise<QueuedOperation[]> {
    return this.loadQueue();
  }

  /**
   * Updates an item's status after a sync attempt (e.g. accepted by server, rejected, or 409 conflict).
   */
  async markResult(
    id: string,
    result: 'accepted' | 'rejected' | 'conflicted',
    errorCode?: string,
    errorMessage?: string
  ): Promise<void> {
    const queue = await this.loadQueue();
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
