import { MemoryLocalStore } from '../services/storage/LocalStore';
import { DefaultOfflineOperationRepository } from '../services/storage/OfflineOperationRepository';
import { QueuedOperation } from '../domain/outbox';

describe('RideJaunm R6 LocalStore & Outbox Repository', () => {
  let store: MemoryLocalStore;
  let repo: DefaultOfflineOperationRepository;

  beforeEach(() => {
    store = new MemoryLocalStore();
    repo = new DefaultOfflineOperationRepository(store);
  });

  test('reads, writes, and removes values correctly in store', async () => {
    await store.write('test_key', { count: 42 });
    const value = await store.read<{ count: number }>('test_key');
    expect(value).toEqual({ count: 42 });

    await store.remove('test_key');
    const removed = await store.read('test_key');
    expect(removed).toBeNull();
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

  test('marks operation result as accepted and filters out from pending list', async () => {
    const op: QueuedOperation = {
      operationId: 'op-sos-01',
      idempotencyKey: 'idemp-sos-01',
      operationType: 'QUEUE_SOS_BREADCRUMB',
      payload: { coords: [85.34, 27.67] },
      state: 'queued',
      createdAtUtc: new Date().toISOString(),
      attemptCount: 0,
    };

    await repo.enqueue(op);
    expect((await repo.listPending()).length).toBe(1);

    await repo.markResult('op-sos-01', 'accepted');
    const pending = await repo.listPending();
    expect(pending.length).toBe(0);

    const all = await repo.listAll();
    expect(all.length).toBe(1);
    expect(all[0].state).toBe('accepted');
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

    expect(await store.read('active_user')).toBeNull();
    expect((await repo.listAll()).length).toBe(0);
  });
});
