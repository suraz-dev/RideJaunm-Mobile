import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppStateProvider, useAppState } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import { kathmanduToPokharaSupercurvy } from '../fixtures';
import { QueuedOperation } from '../domain/outbox';

describe('RideJaunm R6 AppStateContext Integration', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppStateProvider store={memoryStore}>{children}</AppStateProvider>
  );

  test('hydrates app state and manages active route selection', async () => {
    const { result } = await renderHook(() => useAppState(), { wrapper });

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    expect(result.current.activeRoute.profile).toBe('curvy');

    await act(async () => {
      result.current.setActiveRoute(kathmanduToPokharaSupercurvy);
    });

    expect(result.current.activeRoute.profile).toBe('supercurvy');
    expect(result.current.activeRoute.curvinessScore).toBe(9.4);
  });

  test('switches connectivity states and updates user notices', async () => {
    const { result } = await renderHook(() => useAppState(), { wrapper });

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    expect(result.current.connectionState.mode).toBe('online');

    await act(async () => {
      result.current.setConnectionMode('meshOnly');
    });

    expect(result.current.connectionState.mode).toBe('meshOnly');
    expect(result.current.connectionState.cellularSignalBars).toBe(0);

    await act(async () => {
      result.current.setConnectionMode('deadZone');
    });

    expect(result.current.connectionState.mode).toBe('deadZone');
  });

  test('enqueues outbox operations and increments pending counter', async () => {
    const { result } = await renderHook(() => useAppState(), { wrapper });

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    expect(result.current.pendingOperationsCount).toBe(0);

    const op: QueuedOperation = {
      operationId: 'op-hazard-01',
      idempotencyKey: 'idemp-hazard-01',
      operationType: 'REPORT_HAZARD',
      payload: { location: 'Mugling' },
      state: 'queued',
      createdAtUtc: new Date().toISOString(),
      attemptCount: 0,
    };

    await act(async () => {
      await result.current.enqueueOperation(op);
    });

    expect(result.current.pendingOperationsCount).toBe(1);
  });

  test('resets account data and wipes local store and outbox', async () => {
    const { result } = await renderHook(() => useAppState(), { wrapper });

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    await act(async () => {
      result.current.setActiveRoute(kathmanduToPokharaSupercurvy);
    });

    await act(async () => {
      await result.current.resetAccountData();
    });

    expect(result.current.activeRoute.profile).toBe('curvy');
    expect(result.current.pendingOperationsCount).toBe(0);
    expect(result.current.connectionState.mode).toBe('online');
  });
});
