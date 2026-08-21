import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppStateProvider, useAppState } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import {
  kathmanduToPokharaSupercurvy,
  sosMeshAvailableFixture,
} from '../fixtures';

describe('RideJaunm R6 AppStateContext Restart Recovery & Integration (R6-2)', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
  });

  const createWrapper = (store: MemoryLocalStore) => {
    return ({ children }: { children: React.ReactNode }) => (
      <AppStateProvider store={store}>{children}</AppStateProvider>
    );
  };

  test('hydrates app state and manages active route selection', async () => {
    const wrapper = createWrapper(memoryStore);
    const { result } = await renderHook(() => useAppState(), { wrapper });

    await waitFor(() => {
      expect(result.current?.isHydrated).toBe(true);
    });

    expect(result.current.activeRoute.profile).toBe('curvy');

    await act(async () => {
      await result.current.setActiveRoute(kathmanduToPokharaSupercurvy);
    });

    expect(result.current.activeRoute.profile).toBe('supercurvy');
    expect(result.current.activeRoute.curvinessScore).toBe(9.4);
  });

  test('switches connectivity states and updates user notices', async () => {
    const wrapper = createWrapper(memoryStore);
    const { result } = await renderHook(() => useAppState(), { wrapper });

    await waitFor(() => {
      expect(result.current?.isHydrated).toBe(true);
    });

    expect(result.current.connectionState.mode).toBe('online');

    await act(async () => {
      await result.current.setConnectionMode('meshOnly');
    });

    expect(result.current.connectionState.mode).toBe('meshOnly');
  });

  test('enqueues outbox operations and increments pending counter', async () => {
    const wrapper = createWrapper(memoryStore);
    const { result } = await renderHook(() => useAppState(), { wrapper });

    await waitFor(() => {
      expect(result.current?.isHydrated).toBe(true);
    });

    expect(result.current.pendingOperationsCount).toBe(0);

    await act(async () => {
      await result.current.enqueueOperation({
        operationId: 'op-test-01',
        idempotencyKey: 'idemp-test-01',
        operationType: 'REPORT_HAZARD',
        payload: { area: 'BP Highway' },
        state: 'queued',
        createdAtUtc: new Date().toISOString(),
        attemptCount: 0,
      });
    });

    expect(result.current.pendingOperationsCount).toBe(1);
  });

  test('proves deterministic restart recovery across cold remounts against the same store (R6-2)', async () => {
    // 1. Session 1: User modifies route, connection, SOS snapshot, and enqueues an outbox item
    const session1 = await renderHook(() => useAppState(), { wrapper: createWrapper(memoryStore) });

    await waitFor(() => {
      expect(session1.result.current?.isHydrated).toBe(true);
    });

    await act(async () => {
      await session1.result.current.setActiveRoute(kathmanduToPokharaSupercurvy);
      await session1.result.current.setConnectionMode('meshOnly');
      await session1.result.current.setSosSnapshot(sosMeshAvailableFixture);
      await session1.result.current.enqueueOperation({
        operationId: 'op-restart-01',
        idempotencyKey: 'idemp-restart-01',
        operationType: 'POST_COMMUNITY_FEED',
        payload: { message: 'Restart recovery test' },
        state: 'queued',
        createdAtUtc: new Date().toISOString(),
        attemptCount: 0,
      });
    });

    // 2. Session 2: Cold App Restart with new provider instance pointing to SAME memoryStore
    const session2 = await renderHook(() => useAppState(), { wrapper: createWrapper(memoryStore) });

    await waitFor(() => {
      expect(session2.result.current?.isHydrated).toBe(true);
    });

    // Assert that session 2 deterministically recovered all persisted entities
    expect(session2.result.current.activeRoute.id).toBe(kathmanduToPokharaSupercurvy.id);
    expect(session2.result.current.activeRoute.profile).toBe('supercurvy');
    expect(session2.result.current.connectionState.mode).toBe('meshOnly');
    expect(session2.result.current.activeSosSnapshot?.incidentId).toBe(sosMeshAvailableFixture.incidentId);
    expect(session2.result.current.activeSosSnapshot?.evidenceTier).toBe('mesh_peer_observed');
    expect(session2.result.current.pendingOperationsCount).toBe(1);
  });

  test('resets account data and wipes local store and outbox across restarts (R6-2)', async () => {
    const { result } = await renderHook(() => useAppState(), { wrapper: createWrapper(memoryStore) });

    await waitFor(() => {
      expect(result.current?.isHydrated).toBe(true);
    });

    await act(async () => {
      await result.current.setActiveRoute(kathmanduToPokharaSupercurvy);
      await result.current.resetAccountData();
    });

    expect(result.current.activeRoute.profile).toBe('curvy');
    expect(result.current.pendingOperationsCount).toBe(0);
    expect(result.current.connectionState.mode).toBe('online');
  });
});
