/**
 * Outbox & Offline Queued Operations
 * Ensures transactional writes, replay idempotency, and truthful evidence tracking.
 */

export type OperationId = string;
export type IdempotencyKey = string;

export type OperationType =
  | 'RECORD_RIDE_TELEMETRY'
  | 'REPORT_HAZARD'
  | 'POST_COMMUNITY_FEED'
  | 'UPDATE_GARAGE'
  | 'QUEUE_SOS_BREADCRUMB';

export type OperationState =
  | 'queued'      // Stored locally in encrypted store
  | 'sending'     // In transit over network/mesh
  | 'accepted'    // Confirmed received by server / peer
  | 'rejected'    // Rejected with permanent error
  | 'conflicted'; // Conflict (version mismatch / 409)

export interface QueuedOperation<T = Record<string, unknown>> {
  operationId: OperationId;
  idempotencyKey: IdempotencyKey;
  operationType: OperationType;
  payload: T;
  state: OperationState;
  createdAtUtc: string;
  attemptCount: number;
  lastAttemptUtc?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
}
