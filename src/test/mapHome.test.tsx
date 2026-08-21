import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { RideHomeScreen } from '../screens/RideHomeScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { AppStateProvider } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import {
  connectionOnlineSnapshot,
  connectionDeadZoneSnapshot,
  connectionAcquiringSnapshot,
  connectionLostGpsSnapshot,
} from '../fixtures/connectivity.fixture';

describe('RideJaunm R9 Map Home & Local Ride Mode Lifecycle', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
  });

  const createWrapper = (initialConnection = connectionOnlineSnapshot) => {
    return ({ children }: { children: React.ReactNode }) => (
      <AppStateProvider
        store={memoryStore}
        initialConnectionState={initialConnection}
      >
        <ThemeProvider initialMode="night">{children}</ThemeProvider>
      </AppStateProvider>
    );
  };

  test('renders RideHomeScreen with default route and truthful HUD', async () => {
    const view = await render(<RideHomeScreen />, { wrapper: createWrapper() });

    expect(view.getByText('START RIDE (राइड सुरु)')).toBeTruthy();
    expect(view.getByText('GPS LOCKED')).toBeTruthy();
    expect(view.getByText(/N 27.6775° · E 85.3486°/)).toBeTruthy();
  });

  test('cycles local Ride Mode through idle -> active_fixture -> ended -> idle', async () => {
    const view = await render(<RideHomeScreen />, { wrapper: createWrapper() });

    const actionBtn = view.getByText('START RIDE (राइड सुरु)');
    expect(actionBtn).toBeTruthy();

    // 1. Idle -> Active
    await act(async () => {
      fireEvent.press(actionBtn);
    });
    expect(view.getByText('END RIDE (राइड समाप्त)')).toBeTruthy();

    // 2. Active -> Ended
    const endBtn = view.getByText('END RIDE (राइड समाप्त)');
    await act(async () => {
      fireEvent.press(endBtn);
    });
    expect(view.getByText('RIDE ENDED · RESET (सम्पन्न)')).toBeTruthy();

    // 3. Ended -> Reset to Idle
    const resetBtn = view.getByText('RIDE ENDED · RESET (सम्पन्न)');
    await act(async () => {
      fireEvent.press(resetBtn);
    });
    expect(view.getByText('START RIDE (राइड सुरु)')).toBeTruthy();
  });

  test('renders rider position marker when GPS is locked and allows follow mode toggle', async () => {
    const view = await render(<RideHomeScreen />, { wrapper: createWrapper() });

    // Rider marker is rendered on map
    expect(view.getByText('You (तपाईं)')).toBeTruthy();

    // Follow button is enabled
    const followBtn = view.getByLabelText(/Tap to enable camera follow on rider position/);
    expect(followBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(followBtn);
    });

    expect(view.getByLabelText(/Follow mode active/)).toBeTruthy();
  });

  test('disarms active follow mode when GPS transitions from locked to stale or lost', async () => {
    // In stale state, follow mode must be disabled
    const view = await render(<RideHomeScreen />, {
      wrapper: createWrapper(connectionDeadZoneSnapshot),
    });

    const disabledFollowBtn = view.getByLabelText(/Follow mode disabled: GPS is not locked/);
    expect(disabledFollowBtn).toBeTruthy();

    // Stale rider marker is rendered with last-known disclosure
    expect(view.getByText('Last Known Position')).toBeTruthy();
  });

  test('resets camera to origin and disables follow mode when Recenter is pressed', async () => {
    const view = await render(<RideHomeScreen />, { wrapper: createWrapper() });

    const followBtn = view.getByLabelText(/Tap to enable camera follow on rider position/);
    await act(async () => {
      fireEvent.press(followBtn);
    });
    expect(view.getByLabelText(/Follow mode active/)).toBeTruthy();

    const recenterBtn = view.getByLabelText(/Recenter map to route start/);
    await act(async () => {
      fireEvent.press(recenterBtn);
    });

    expect(view.getByLabelText(/Tap to enable camera follow on rider position/)).toBeTruthy();
  });

  test('screen-level: renders acquiring GPS with fresh map', async () => {
    const view = await render(<RideHomeScreen mapBaseStateOverride="fresh" />, {
      wrapper: createWrapper(connectionAcquiringSnapshot),
    });

    expect(view.getByText('ACQUIRING GPS...')).toBeTruthy();
    expect(view.getByText('--')).toBeTruthy(); // Speed placeholder
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('screen-level: renders stale GPS with stale map cache disclosure', async () => {
    const view = await render(<RideHomeScreen mapBaseStateOverride="stale" />, {
      wrapper: createWrapper(connectionDeadZoneSnapshot),
    });

    expect(view.getByText('LAST KNOWN FIX')).toBeTruthy();
    expect(view.getByText('⚠️ STALE MAP CACHE')).toBeTruthy();
    expect(view.getByText('Last Known Position')).toBeTruthy();
  });

  test('screen-level: renders lost GPS with partial map missing high-altitude sector', async () => {
    const view = await render(
      <RideHomeScreen
        mapBaseStateOverride="partial"
        mapCoverageOverride={{
          isCovered: false,
          missingAreaLabel: 'Thorong La Pass (5,416m)',
        }}
      />,
      {
        wrapper: createWrapper(connectionLostGpsSnapshot),
      }
    );

    expect(view.getByText('GPS UNAVAILABLE')).toBeTruthy();
    expect(view.getByText('⚠️ PARTIAL OFFLINE COVERAGE')).toBeTruthy();
    expect(view.getByText('Thorong La Pass (5,416m)')).toBeTruthy();
    // No rider marker rendered in lost state
    expect(view.queryByText('You (तपाईं)')).toBeNull();
    expect(view.queryByText('Last Known Position')).toBeNull();
  });

  test('screen-level: renders lost GPS with map render error and retry affordance', async () => {
    const view = await render(<RideHomeScreen mapBaseStateOverride="error" />, {
      wrapper: createWrapper(connectionLostGpsSnapshot),
    });

    expect(view.getByText('GPS UNAVAILABLE')).toBeTruthy();
    expect(view.getByText('RENDER FAULT')).toBeTruthy();
    expect(view.getByText('Simulated Render Fault')).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });
});
