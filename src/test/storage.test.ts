import { MemoryLocalStore } from '../services/storage/LocalStore';
import { DefaultOfflineOperationRepository } from '../services/storage/OfflineOperationRepository';
import { QueuedOperation } from '../domain/outbox';

describe('RideJaunm R6 LocalStore & Outbox Repository (R6-4, R6-5)', () => {
  let store: MemoryLocalStore;
  let repo: DefaultOfflineOperationRepository;

  beforeEach(() => {
    store = new MemoryLocalStore();
    repo = new DefaultOfflineOperationRepository(store);
  });

  test('reads, writes, and removes values with explicit StorageReadResult status', async () => {
    await store.write('test_key', { count: 42 });
    const result = await store.read<{ count: number }>('test_key');
    expect(result.status).toBe('found');
    if (result.status === 'found') {
      expect(result.data).toEqual({ count: 42 });
    }

    await store.remove('test_key');
    const removed = await store.read('test_key');
    expect(removed.status).toBe('not_found');
  });

  test('surfaces explicit corrupted status when raw storage value is malformed JSON (R6-5)', async () => {
    store.setRawValue('corrupted_key', '{ invalid_json: ');
    const result = await store.read('corrupted_key');
    expect(result.status).toBe('corrupted');
    if (result.status === 'corrupted') {
      expect(result.rawValue).toBe('{ invalid_json: ');
      expect(result.error).toBeDefined();
    }
  });

  test('surfaces explicit read_failed status on storage IO error (R6-5)', async () => {
    store.setSimulateReadFailure(true);
    const result = await store.read('any_key');
    expect(result.status).toBe('read_failed');
    if (result.status === 'read_failed') {
      expect(result.error).toContain('Simulated memory store IO error');
    }
  });

  test('enqueues outbox operations and prevents duplicate logical records via idempotency key', async () => {
    const op1: QueuedOperation<{ hazardId: string }> = {
      operationId: 'op-001',
      idempotencyKey: 'idemp-hazard-report-01',
      operationType: 'REPORT_HAZARD',
      payload: { hazardId: 'hazard-01' },
      state: 'queued',
      createdAtUtc: new Date().toISOString(),
      attemptCount: 0,
    };

    await repo.enqueue(op1);
    const pending1 = await repo.listPending();
    expect(pending1.length).toBe(1);

    // Replay/retry with same idempotency key should update, not duplicate
    const op1Duplicate: QueuedOperation<{ hazardId: string }> = {
      ...op1,
      attemptCount: 1,
      lastErrorCode: 'NETWORK_TIMEOUT',
    };
    await repo.enqueue(op1Duplicate);

    const pendingAfterDuplicate = await repo.listPending();
    expect(pendingAfterDuplicate.length).toBe(1);
    expect(pendingAfterDuplicate[0].attemptCount).toBe(1);
  });

  test('negative test: local enqueue produces ONLY queued locally state and never server delivery claims (R6-4)', async () => {
    const op: QueuedOperation = {
      operationId: 'op-local-01',
      idempotencyKey: 'idemp-truthful-01',
      operationType: 'QUEUE_SOS_BREADCRUMB',
      payload: { lat: 28.78, lng: 83.85 },
      state: 'queued',
      createdAtUtc: new Date().toISOString(),
      attemptCount: 0,
    };

    await repo.enqueue(op);
    const pending = await repo.listPending();

    expect(pending[0].state).toBe('queued');
    expect(pending[0].state).not.toBe('accepted');
  });

  test('clears all account scoped data during reset', async () => {
    await store.write('active_user', { name: 'Suraj' });
    await repo.enqueue({
      operationId: 'op-02',
      idempotencyKey: 'idemp-02',
      operationType: 'UPDATE_GARAGE',
      payload: {},
      state: 'queued',
      createdAtUtc: new Date().toISOString(),
      attemptCount: 0,
    });

    await store.clearAccountScopedData();
    await repo.clear();

    const readUser = await store.read('active_user');
    expect(readUser.status).toBe('not_found');
    expect((await repo.listAll()).length).toBe(0);
  });
});
