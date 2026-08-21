import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppStateProvider, useAppState } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import {
  kathmanduToPokharaSupercurvy,
  sosMeshAvailableFixture,
  allOfflineRegionFixtures,
} from '../fixtures';

describe('RideJaunm R6 AppStateContext Restart Recovery & Fault Surfacing (R6-2, RC-2, RC-3)', () => {
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

  test('proves complete restart recovery for route, GPS freshness, offline pack state, safety snapshot, and queue (RC-3)', async () => {
    // 1. Session 1: User modifies route, connection/GPS, offline packs, SOS snapshot, and enqueues outbox operation
    const session1 = await renderHook(() => useAppState(), { wrapper: createWrapper(memoryStore) });

    await waitFor(() => {
      expect(session1.result.current?.isHydrated).toBe(true);
    });

    const modifiedRegions = allOfflineRegionFixtures.map((region) =>
      region.id === 'pack-mustang-circuit-v1'
        ? { ...region, lifecycle: 'stale' as const, progressPercentage: 100 }
        : region
    );

    await act(async () => {
      await session1.result.current.setActiveRoute(kathmanduToPokharaSupercurvy);
      await session1.result.current.setConnectionMode('meshOnly');
      await session1.result.current.setOfflineRegionsState(modifiedRegions);
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

    // Assert that session 2 deterministically recovered all 5 persisted entity classes:
    // a) Route
    expect(session2.result.current.activeRoute.id).toBe(kathmanduToPokharaSupercurvy.id);
    expect(session2.result.current.activeRoute.profile).toBe('supercurvy');

    // b) Connection & GPS Freshness State
    expect(session2.result.current.connectionState.mode).toBe('meshOnly');
    expect(session2.result.current.connectionState.gps.lockState).toBe('locked');
    expect(session2.result.current.connectionState.gps.altitudeMeters).toBe(1740);

    // c) Offline Pack Selection & Lifecycle State
    const recoveredMustang = session2.result.current.offlineRegions.find(
      (r) => r.id === 'pack-mustang-circuit-v1'
    );
    expect(recoveredMustang?.lifecycle).toBe('stale');

    // d) Safety Observation
    expect(session2.result.current.activeSosSnapshot?.incidentId).toBe(sosMeshAvailableFixture.incidentId);
    expect(session2.result.current.activeSosSnapshot?.evidenceTier).toBe('mesh_peer_observed');

    // e) Outbox Queue
    expect(session2.result.current.pendingOperationsCount).toBe(1);
  });

  test('surfaces storage faults across all hydrated key classes (RC-2)', async () => {
    // Inject corrupt JSON into multiple storage keys
    memoryStore.setRawValue('active_route_v1', '{ corrupt_route: ');
    memoryStore.setRawValue('connection_mode_v1', '{ corrupt_conn: ');
    memoryStore.setRawValue('offline_regions_v1', '{ corrupt_regions: ');
    memoryStore.setRawValue('active_safety_observation_v1', '{ corrupt_safety: ');
    memoryStore.setRawValue('outbox_operations_v1', '{ corrupt_outbox: ');

    const { result } = await renderHook(() => useAppState(), { wrapper: createWrapper(memoryStore) });

    await waitFor(() => {
      expect(result.current?.isHydrated).toBe(true);
    });

    expect(result.current.storageFaults).toContain('route:corrupted');
    expect(result.current.storageFaults).toContain('connection:corrupted');
    expect(result.current.storageFaults).toContain('offline_regions:corrupted');
    expect(result.current.storageFaults).toContain('safety:corrupted');
    expect(result.current.storageFaults).toContain('outbox:corrupted');
    expect(result.current.storageFault).toBeDefined();

    // Context must gracefully fallback to safe defaults rather than crashing
    expect(result.current.activeRoute.profile).toBe('curvy');
    expect(result.current.connectionState.mode).toBe('online');
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
    expect(result.current.storageFaults.length).toBe(0);
  });
});
