/**
 * Outbox & Queued Operation Repository
 * Handles idempotent queuing, retries, and persistence of offline operations.
 */

import { LocalStore } from './LocalStore';
import { QueuedOperation, OperationState } from '../../domain/outbox';

const OUTBOX_STORAGE_KEY = 'outbox_operations_v1';

export interface OfflineOperationRepository {
  enqueue(operation: QueuedOperation): Promise<void>;
  listPending(): Promise<QueuedOperation[]>;
  listAll(): Promise<QueuedOperation[]>;
  markResult(
    id: string,
    result: 'accepted' | 'rejected' | 'conflicted',
    errorCode?: string,
    errorMessage?: string
  ): Promise<void>;
  clear(): Promise<void>;
}

export class DefaultOfflineOperationRepository implements OfflineOperationRepository {
  constructor(private store: LocalStore) {}

  private async loadQueue(): Promise<QueuedOperation[]> {
    const raw = await this.store.read<QueuedOperation[]>(OUTBOX_STORAGE_KEY);
    return raw || [];
  }

  private async saveQueue(queue: QueuedOperation[]): Promise<void> {
    await this.store.write(OUTBOX_STORAGE_KEY, queue);
  }

  async enqueue(operation: QueuedOperation): Promise<void> {
    const queue = await this.loadQueue();
    // Prevent duplicate logical enqueue by idempotency key
    const existingIndex = queue.findIndex(
      (op) => op.idempotencyKey === operation.idempotencyKey
    );
    if (existingIndex >= 0) {
      // Update existing
      queue[existingIndex] = {
        ...queue[existingIndex],
        ...operation,
      };
    } else {
      queue.push(operation);
    }
    await this.saveQueue(queue);
  }

  async listPending(): Promise<QueuedOperation[]> {
    const queue = await this.loadQueue();
    return queue.filter((op) => op.state === 'queued' || op.state === 'sending');
  }

  async listAll(): Promise<QueuedOperation[]> {
    return this.loadQueue();
  }

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

  async clear(): Promise<void> {
    await this.store.remove(OUTBOX_STORAGE_KEY);
  }
}
